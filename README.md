# Codecommit Repository Replication CDK in typescript 

CDK in Typescript 로 작성되었습니다. 하나의 AWS 어카운트에 가지고 있는 CodeCommit Repository 를
다른 AWS Account 에 환경에 동일하게 복젝합니다.

원본 Origin Codecommit Repository 중 main 브랜치가 변경이 일어나면, 다른 AWS Account 의 Code Build 가
실행되어 소스코드를 동기화 합니다.

## Configurations
아래 위치의 파일을 변경하여 AWS Account 정보와 AWS Account Repository 정보를 설정하세요.
- lib\configurations.ts

```
export namespace Origin {
    export const accountId = "";        # 여기는 원본 Codecommit Repository 가 있는 AWS Account 입니다. AWS Account 번호를 입력하세요.
    export const region    = "ap-northeast-2";
    export const roleArn   = "TargetAccountCodeCommitFullAccess";
    export const roleName  = "TargetAccountCodeCommitFullAccess";
}

export namespace  Target {
    export const accountId = "";         # 여기는 복제 대상 Codecommit Repository 가 있는 AWS Account 입니다. AWS Account 번호를 입력하세요.
    export const region    = "ap-northeast-2";
    export const eventBusName = "TargetCodecommitReplicationEventBus";
}

export namespace Repositories {
    export const repositoryNames = [     # 복제의 대상이 되는 Origin Account 에 존재하는 Code Commit Repository 입니다. 
        'test',
    ];
}


```

## Origin Account 에 Stack 생성
`cdk deploy OriginCodecommitStack`

## 복제 대상 Account 에 Stack 생성
`cdk deploy TargetCodecommitReplicationStack`