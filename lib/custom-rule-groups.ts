import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';
import _ = require('lodash');
import { ManagedRuleGroups } from './managed-rule-groups';
import { RegularExpressions } from './reqular-expressions';

export class CustomRuleGroup {
    public name: string;
    public patterns: string[];
    public capacity: number;
    public statment: wafv2.CfnRuleGroup.StatementProperty
    public fieldToMatch: wafv2.CfnRuleGroup.FieldToMatchProperty;
    public textTransformations: wafv2.CfnRuleGroup.TextTransformationProperty[];
    public action: wafv2.CfnRuleGroup.RuleActionProperty;

    constructor(
        name: string,
        capacity: number,
        statment: wafv2.CfnRuleGroup.StatementProperty,
        action: wafv2.CfnRuleGroup.RuleActionProperty = { block: {} }) {
        this.name = name;
        this.statment = statment;
        this.capacity = capacity;
        this.action = action;
    }
}

export class CustomRuleGroups {
    static basePriority = ManagedRuleGroups.managedRuleGroups.length
    private static ruleGroups(regexMap: { [key: string]: string; }) {
        return [
            // Rate limit
            new CustomRuleGroup("RateLimit", 55, {
                rateBasedStatement: {
                    limit: 7000,
                    aggregateKeyType: "IP"
                }
            }, {
                block: {}
            }),
            // Challange out of country
            new CustomRuleGroup("ChallangeOutOfIsrael", 55, {
                notStatement: {
                    statement: {
                        geoMatchStatement: {
                            countryCodes: ["IL"],
                            forwardedIpConfig: {
                                headerName: "X-Forwarded-For",
                                fallbackBehavior: "MATCH",
                            },
                        }
                    }
                }
            }, {
                challenge: {}
            }),
        ]
    }

    public static defineRuleGroups(scope: Construct, regexMap: { [key: string]: string; }): wafv2.CfnRuleGroup[] {
        return _
            .chain(CustomRuleGroups.ruleGroups(regexMap))
            .map(x => {
                return new wafv2.CfnRuleGroup(scope, `RuleGroup${x.name}`, {
                    name: `RuleGroup${x.name}`,
                    scope: "CLOUDFRONT",
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
            })
            .value()
    }

    public static cfnRuleGroupToCfnWebAclRuleProperty(cfnRuleGroup: wafv2.CfnRuleGroup, priority: number): wafv2.CfnWebACL.RuleProperty {
        return {
            name: `${cfnRuleGroup.name}`,
            priority: CustomRuleGroups.basePriority + priority,
            overrideAction: {
                none: {
                }
            },
            visibilityConfig: {
                sampledRequestsEnabled: true,
                cloudWatchMetricsEnabled: true,
                metricName: `RuleWebAcl${cfnRuleGroup.name}`
            },
            statement: {
                ruleGroupReferenceStatement: {
                    arn: cfnRuleGroup.attrArn,
                }
            }
        }

    }

    public static webAclRuleStatments(scope: Construct): wafv2.CfnWebACL.RuleProperty[] {
        let regexMap = RegularExpressions.defineRegularExpressions(scope)
        let cfnRuleGroups = CustomRuleGroups.defineRuleGroups(scope, regexMap)
        return _
            .chain(cfnRuleGroups)
            .map(cfnRuleGroup =>
                CustomRuleGroups.cfnRuleGroupToCfnWebAclRuleProperty(cfnRuleGroup, cfnRuleGroups.indexOf(cfnRuleGroup))
            )
            .value()
    }
}