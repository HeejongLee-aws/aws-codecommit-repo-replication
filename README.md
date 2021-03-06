# Codecommit Repository Replication CDK in typescript 

CDK in Typescript 로 작성되었습니다. AWS 어카운트의 CodeCommit Repository 를
다른 AWS Account 에 환경에 동일하게 복제합니다.

원본 Codecommit Repository 중 main 브랜치가 변경이 일어나면, 다른 AWS Account 의 Code Build 가
실행되어 동일한 Repository로 소스코드를 동기화 합니다.

## Configurations
아래 위치의 파일을 변경하여 AWS Account 정보와 AWS Account Repository 정보를 설정하세요.
- lib\configurations.ts

```
export namespace Origin {
    export const accountId = "";  # 원본 Codecommit Repository 가 있는 AWS Account 번호
    export const region    = "ap-northeast-2";
    export const roleArn   = "TargetAccountCodeCommitFullAccess";
    export const roleName  = "TargetAccountCodeCommitFullAccess";
}

export namespace  Target {
    export const accountId = ""; # 복제 대상 Codecommit Repository 가 있는 AWS Account 번호
    export const region    = "ap-northeast-2";
    export const eventBusName = "TargetCodecommitReplicationEventBus";
}

export namespace Repositories {
    export const repositoryNames = [     
        'test',                 # 복제의 Codecommit Repository 입니다. 
    ];
}


```

## Origin Account 에 Stack 생성
`cdk deploy OriginCodecommitStack`

## 복제 대상 Account 에 Stack 생성
`cdk deploy TargetCodecommitReplicationStack`