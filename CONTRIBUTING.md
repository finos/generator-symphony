# How to contribute

If you found a bug or issue, please ensure the bug was not already reported by searching in
[GitHub issues](https://github.com/SymphonyPlatformSolutions/generator-symphony/issues).
If you are unable to find an open issue addressing the problem, open a new one.
Be sure to include a title and clear description, the SDK version, and a code sample demonstrating the issue.

If you open a PR to fix any issue, please reference the ticket in the PR title.
A [Symphony SDK team](https://github.com/orgs/SymphonyPlatformSolutions/teams/symphony-sdk/members) member
will have to approve before it is merged and eventually released.

If you want to request an enhancement or feature, please open a Github issue if none has been opened before.
New feature requests on the legacy SDK will not be accepted.

## Module and package structure

The code is structured into several generators inside the [generators folder](generators):
* [2.0](generators/bdk/java) generating a bot and using the [Java BDK2.0](https://github.com/finos/symphony-bdk-java);
* `*-bots` folders generating bots, using the [.NET](https://github.com/SymphonyPlatformSolutions/symphony-api-client-dotnet),
[legacy java](https://github.com/SymphonyPlatformSolutions/symphony-api-client-java/tree/master/symphony-bdk-legacy/symphony-api-client-java),
[node](https://github.com/SymphonyPlatformSolutions/symphony-api-client-node) and
[python](https://github.com/SymphonyPlatformSolutions/symphony-api-client-python) SDKs;
* `*-ext-apps` folders generating extension apps, using the
[legacy java](https://github.com/SymphonyPlatformSolutions/symphony-api-client-java/tree/master/symphony-bdk-legacy/symphony-api-client-java)
and [node](https://github.com/SymphonyPlatformSolutions/symphony-api-client-node) SDKs.

## Documentation

Packages and public methods should be properly commented with relevant information.
