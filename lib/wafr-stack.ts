import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { RuleGroup, RuleGroups } from './rule-groups';
import { RegularExpressions } from './reqular-expressions';

/**
 * TODO:
 * make prettier
 */


export class WafrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    let regexMap: { [key: string]: string; } = {}
    let rules: wafv2.CfnWebACL.RuleProperty[] = []

    for (let x of RegularExpressions.regex()) {
      let regex = new wafv2.CfnRegexPatternSet(this, `RuleSet${x.name}`, {
        scope: "REGIONAL",
        name: x.name,
        regularExpressionList: x.patterns
      })
      regexMap[x.name] = regex.attrArn
    }

    let ruleGroups: RuleGroup[] = RuleGroups.ruleGroups(regexMap)
    for (let i = 0; i < ruleGroups.length; i++) {
      let x = ruleGroups[i]
      let rg = new wafv2.CfnRuleGroup(this, `RuleGroup${x.name}`, {
        name: `RuleGroup${x.name}`,
        scope: "REGIONAL",
        capacity: x.capacity,
        rules: [
          {
            name: x.name,
            visibilityConfig: {
              metricName: `Rule${x.name}`,
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
            },
            priority: 0,
            action: x.action,
            statement: x.statment
          }
        ],
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `RuleGroup${x.name}`
        }
      })
      rules.push({
        name: `${x.name}`,
        priority: i,
        overrideAction: {
          none: {
          }
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `RuleWebAcl${x.name}`
        },
        statement: {
          ruleGroupReferenceStatement: {
            arn: rg.attrArn,
          }
        }
      })
    }

    new wafv2.CfnWebACL(this, "CdkAcl", {
      defaultAction: {
        allow: {
        }
      },
      scope: "REGIONAL",
      rules: rules,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "CdkAcl",
        sampledRequestsEnabled: true
      }
    })
  }
}
