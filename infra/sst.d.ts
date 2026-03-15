declare module "aws" {
  namespace aws {
    class Bucket {
      constructor(
        name: string,
        props?: any
      );
    }
    class DynamoDb {
      constructor(name: string, props?: any);
    }
    class CognitoUserPool {
      constructor(name: string, props?: any);
      id: string;
      arn: string;
      attachPermissions(permissions: any[]): any;
    }
    class CognitoUserPoolGroup {
      constructor(name: string, props?: any);
    }
    class ApiGatewayV2 {
      constructor(name: string, props?: any);
      route(path: string, config: any): void;
    }
  }
}

declare global {
  const sst: {
    aws: typeof import("aws").aws;
  };
  function $config(config: {
    app(input?: any): any;
    async run(): Promise<any>;
  }): any;
}

export {};
