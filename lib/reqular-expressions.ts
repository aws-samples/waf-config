import * as fs from 'fs';
import _ = require('lodash');

export class RegularExpressions {
    public name: string;
    public patterns: string[];
    //https://hacken.io/discover/how-to-bypass-waf-hackenproof-cheat-sheet/

    public static phpSystem = _
        .chain(fs.readFileSync('patterns/php_commands.txt', 'utf8').split("\n"))
        .chunk(10)
        .map((commands) => commands.join("|"))
        .map((commandsOr) => `(${commandsOr})(.*)`)
        .value()

    public static commandsToBlock = _
        .chain(fs.readFileSync('patterns/commands.txt', 'utf8').split("\n"))
        .chunk(10)
        .map((commandsOr) => `(?:^|\\W*|;|'|&|\\|)(?:\\b)(${commandsOr.join("|")})(?:$|\\s|&|\\+)`)
        .value()

    public static mlTagsToBlock = fs.readFileSync('patterns/ml_tags.txt', 'utf8').split("\n")
    public static eventHandlers = fs.readFileSync('patterns/event_handlers.txt', 'utf8').split("\n")
    public static directoryTraversal = [
        "(page|directory)%3D(..|%2F)(.*)",
        "(page|directory)=(..|\/)(.*)",
        "..%2F",
        "...%2F",
        "file%3A%2F%2F",
        "%5C(.*)",
        "%2F..%2F",
        ".%2F",
        "%2F%2F",
        "%2F%3F%3F%3F%2F"
    ]

    public static htmlTagsRegex = [
        `(?:<|&lt;)(${RegularExpressions.mlTagsToBlock.join("|")})(?:$|\\W)`,
        `(?:^|\\W*|;|'|&|\\|)(${RegularExpressions.eventHandlers.join("|")})(?:$|\\W)`,
        "(\\/\\*|\/\/)",
        "(.*)::(.*)"
    ]

    // Unix shell expressions
    public static unixShell = [
        /\$(?:\((?:.*|\(.*\))\)|\{.*\})|[<>]\(.*\)|\/[0-9A-Z_a-z]*\[!?.+\]/gm,
        //https://regex101.com/r/V6wrCO/1
        /(?:[*?`\\'][^\/\n]+\/|\$[({\[#@!?*\-_$a-zA-Z0-9]|\/[^\/]+?[*?`\\'])/gm
    ]

    constructor(name: string, patterns: string[]) {
        this.name = name;
        this.patterns = patterns
    }

    public static regex(): RegularExpressions[] {
        _.map(RegularExpressions.unixShell, (regexp) => {

        })

        return [
            new RegularExpressions("UnixShellFromCrs", _.map(RegularExpressions.unixShell, (x) => {
                return x.source
            })),
            new RegularExpressions("DirectoryTraversal", RegularExpressions.directoryTraversal),
            new RegularExpressions("HtmlTags", RegularExpressions.htmlTagsRegex),
            new RegularExpressions("Commands", RegularExpressions.commandsToBlock),
            new RegularExpressions("PhpSystem", RegularExpressions.phpSystem),
        ]

    }
}