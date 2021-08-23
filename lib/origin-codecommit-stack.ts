import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam'
import * as events from '@aws-cdk/aws-events'
import * as eventsTargets from '@aws-cdk/aws-events-targets'
import {Origin, Repositories, Target} from "./configurations";

export class OriginCodecommitStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 01. 모든 이벤트를 PUT 할 수 있는 ROLE 생성
    const eventReplicationRole = new iam.Role(this, `EventReplicationRole`, {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    })
    events.EventBus.grantAllPutEvents(eventReplicationRole);

    // 02. 이벤트를 전달할 대상 이벤트 버스
    const targetEventBusArn = `arn:aws:events:${Target.region}:${Target.accountId}:event-bus/${Target.eventBusName}`;
    const targetSyncEventBus = events.EventBus.fromEventBusArn(this, "targetSyncEventBus", targetEventBusArn)
    const target = new eventsTargets.EventBus(targetSyncEventBus, { role: eventReplicationRole });

    // 03. 타겟에 전달하기 위한 이벤트 룰을 생성한다.
    const eventRule = new events.Rule(this, `OriginCodecommitReplicationRule`, {
      description: 'Propagate event to target account',
      ruleName: `OriginCodecommitEventRule`,
      eventPattern: {
        source: ['aws.codecommit'],
        detail: {
          event: ['referenceCreated', 'referenceUpdated'],
          repositoryName: Repositories.repositoryNames,
          referenceName: ["main"],
        }
      },
    }).addTarget(target);


    // 04. Target Account 에서 Code Commit 을 Access 할 수 있는 Role 생성
    const codeCommitFullAccessRole = new iam.Role(
        this,
        `TrustedAccountCodeCommitFullAccessRole`,
        {
          roleName: Origin.roleName,
          assumedBy: new iam.CompositePrincipal(
              new iam.AccountPrincipal(Target.accountId)
          ),
      }
    )
    codeCommitFullAccessRole.addToPolicy(new iam.PolicyStatement({
      actions: ['codecommit:*'],
      resources: ['*'],
    }));
  }



}

