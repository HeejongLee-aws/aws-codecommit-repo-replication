import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as logs from '@aws-cdk/aws-logs'
import * as events from '@aws-cdk/aws-events'
import * as eventTargets from '@aws-cdk/aws-events-targets'
import * as cb from '@aws-cdk/aws-codebuild'
import {Origin} from "./configurations";

interface IProps {
  eventBus: events.IEventBus
  role: iam.IRole
  repository: IRepository
}

export interface IRepository {
  repositoryName: string
  branchName: string
  region: string
}


export class TargetCodecommitReplicationRuleStack extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: IProps) {
    super(scope, id)

    // 00. 코드 커밋 동기화를 위한 로그 그룹을 생성한다.
    const logGroup = new logs.LogGroup(this, `CodecommitSyncLogGroup`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // 01. 빌드 SPEC 을 정의 한다.
    const buildSpec = this.createBuildSpec(props.repository)

    // 02. 빌드 프로젝트를 정의 한다.
    const project = this.createCodeBuildProject(props.role, buildSpec)

    // 03. Source 의 이벤트를 정의 하고, 이벤트에 수행되어야하는 빌드를 연결한다.
    const event = new events.Rule(this, `CodeCommitSyncRule`, {
      eventBus: props.eventBus,
      eventPattern: {
        source: ['aws.codecommit'],
        detail: {
          event: ['referenceCreated', 'referenceUpdated'],      // 소스 브랜치의 이벤트
          repositoryName: [props.repository.repositoryName],    // 소스의 Repository 이름
          referenceName: [props.repository.branchName],         // 소스의 브랜치 이름
        },
      },
      targets: [
        new eventTargets.CloudWatchLogGroup(logGroup),          // 해당 이벤트의 로그를 남기는 로그 그룹
        new eventTargets.CodeBuildProject(project),             // 해당 이벤트를 수행하는 빌드 프로젝트
      ],
    })
  }

  private createCodeBuildProject(role: iam.IRole, buildSpec: cb.BuildSpec): cb.IProject {
    const project = new cb.Project(this, `SyncProject`, {
      buildSpec,
      role,
      environment: {
        buildImage: cb.LinuxBuildImage.STANDARD_5_0,
        computeType: cb.ComputeType.SMALL,
      },
    })
    project.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: ['*'],
    }))
    return project
  }

  private createBuildSpec(repository: IRepository): cb.BuildSpec {
    const installCommands: string[] = [
      `pip install git-remote-codecommit`,

      `aws sts get-caller-identity`,
      `export ORIG_AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID`,
      `export ORIG_AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY`,
      `export ORIG_AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN`,
    ]
    const preBuildCommands: string[] = [
      `aws sts assume-role --role-arn ${Origin.roleArn} --role-session-name CrocaCode | jq '.Credentials' -r > amz.auth.json`,
      `cat amz.auth.json`,
    ]
    const buildCommands: string[] = [
      `export AWS_ACCESS_KEY_ID=$(cat amz.auth.json | jq '.AccessKeyId' -r)`,
      `export AWS_SECRET_ACCESS_KEY=$(cat amz.auth.json | jq '.SecretAccessKey' -r)`,
      `export AWS_SESSION_TOKEN=$(cat amz.auth.json | jq '.SessionToken' -r)`,

      `aws sts get-caller-identity`,
      `git clone --mirror codecommit::${Origin.region}://${repository.repositoryName} ${repository.repositoryName}`,
      `cd ${repository.repositoryName}`,

      `export AWS_ACCESS_KEY_ID=$ORIG_AWS_ACCESS_KEY_ID`,
      `export AWS_SECRET_ACCESS_KEY=$ORIG_AWS_SECRET_ACCESS_KEY`,
      `export AWS_SESSION_TOKEN=$ORIG_AWS_SESSION_TOKEN`,
      `aws sts get-caller-identity`,

      `git remote set-url --push origin codecommit::${repository.region}://${repository.repositoryName}`,
      `git push origin`,
      `cd ..`
    ]

    return cb.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          commands: installCommands,
        },
        pre_build: {
          commands: preBuildCommands,
        },
        build: {
          commands: buildCommands
        }
      },
    })
  }

}