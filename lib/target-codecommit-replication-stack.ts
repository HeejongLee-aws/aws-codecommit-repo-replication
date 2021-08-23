import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam'
import * as events from '@aws-cdk/aws-events'
import {TargetCodecommitReplicationRuleStack} from "./target-codecommit-replication-rule-stack";
import {Origin, Repositories, Target} from "./configurations";

export class TargetCodecommitReplicationStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);

    // 01. 이벤트 버스를 생성 한다.
    const eventBus = new events.EventBus(this, 'CodecommitReplicationEventBus', {
      eventBusName: Target.eventBusName
    });

    // 02. 이벤트 버스 정책을 정의 한다.
    // Origin 에서 Event 를 Target 으로 보낼 수 있도록 허용 한다.
    new events.CfnEventBusPolicy(this, `CodecommitReplicationStatementPolicy`,
      {
        eventBusName: Target.eventBusName,
        statementId: `CodecommitReplicationStatementId`,
        action: 'events:PutEvents',
        principal: Origin.accountId,
      }
    );

    // 03. 빌드 Role 을 만든다.
    const role = new iam.Role(this, 'CodeBuildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      managedPolicies: [
        { managedPolicyArn: 'arn:aws:iam::aws:policy/AWSCodeCommitFullAccess' },
        { managedPolicyArn: 'arn:aws:iam::aws:policy/CloudWatchLogsFullAccess' },
      ],
    })


      // 04. Sync 를 위한 Build Job 을 생성한다.
    Repositories.repositoryNames.forEach(repositoryName => {

        const repository = {
            repositoryName: repositoryName,
            branchName : "main",
            region : "ap-northeast-2"
        };

        const props = {
            eventBus,
            role,
            repository
        };

      new TargetCodecommitReplicationRuleStack(this, `${repositoryName}-${repository.branchName}-${repository.region}-ReplicationRule`, props)
    })

  }
}

