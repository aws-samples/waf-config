import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { CustomRuleGroups } from './custom-rule-groups';
import _ = require('lodash');
import { ManagedRuleGroups } from './managed-rule-groups';

export class WafrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ctxConfig: any = {
      wafScope: this.node.tryGetContext('wafScope') ? this.node.tryGetContext('wafScope') : 'REGIONAL'
    }

    // example run cdk cli with context
    // cdk synth --context wafScope=REGIONAL
    // cdk synth --context wafScope=CLOUDFRONT

    //create web acl with custom and managed rule groups 
    //https://docs.aws.amazon.com/cdk/api/latest/docs/aws-wafv2-readme.html#aws-wafv2-readme-web-acls-and-rules-overview
    //https://docs.aws.amazon.com/cdk/api/latest/docs/aws-wafv2-readme.html#aws-wafv2-readme-web-acls-and-rules-overview-custom-rule-groups
    //https://docs.aws.amazon.com/cdk/api/latest/docs/aws-wafv2-readme.html#aws-wafv2-readme-web-acls-and-rules-overview-managed-rule-groups

    //create web acl with custom rule groups
    let ruleGroups =
      ManagedRuleGroups
        .webAclRuleStatments()
        .concat(
          CustomRuleGroups.webAclRuleStatments(this, ctxConfig))

    new wafv2.CfnWebACL(this, "CdkAcl", {
      scope: ctxConfig.wafScope,
      defaultAction: {
        allow: {
        }
      },
      rules: ruleGroups,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: "CdkAcl",
      }
    })
  }
}
