# Codecommit Repository Replication CDK in typescript 

## Configurations
- lib\configurations

Please update the configuration to origin and target account for replicating code commit repository before execution

```
export namespace Origin {
    export const accountId = "";        # origin account
    export const region    = "ap-northeast-2";
    export const roleArn   = "TargetAccountCodeCommitFullAccess";
    export const roleName  = "TargetAccountCodeCommitFullAccess";
}

export namespace  Target {
    export const accountId = "";        # target account
    export const region    = "ap-northeast-2";
    export const eventBusName = "TargetCodecommitReplicationEventBus";
}

export namespace Repositories {
    export const repositoryNames = [                # update repositories 
        'test',
    ];
}


```

## Deploy Origin Account
`cdk deploy OriginCodecommitStack`

## Deploy Target Account
`cdk deploy TargetCodecommitReplicationStack`