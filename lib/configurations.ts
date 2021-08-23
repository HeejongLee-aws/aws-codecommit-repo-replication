export namespace Origin {
    export const accountId = "";
    export const region    = "ap-northeast-2";
    export const roleArn   = "TargetAccountCodeCommitFullAccess";
    export const roleName  = "TargetAccountCodeCommitFullAccess";
}

export namespace  Target {
    export const accountId = "";
    export const region    = "ap-northeast-2";
    export const eventBusName = "TargetCodecommitReplicationEventBus";
}

export namespace Repositories {
    export const repositoryNames = [
        'cultureclub-BO-web',
        'cultureclub-web',
        'cultureclub-app',
        'cultureclub-instructor-web'
    ];
}




