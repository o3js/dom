# o3js

## Testing Framework = Mocha
Mocha was chosen because I (gsilk) have used it many times in the past and it just works. Specifically, I like that:
* it doesn't couple the assertion library with the test runner (like Tape)
* it doesn't try be parallel (like AVA), which IMHO would be premature optimization -- and besides we're never going to be IO-bound
* it doesn't require a config file (like Karma)

## Assertion Library = Chai
Chai was chosen over the NodeJS standard assertion library because:
* it works when running tests in the browser
* it displays the original exception (rather than burying it), which is good because:
   * it saves time when diagnosing failing tests and writing new ones
   * it puts the error messages in front of us more regularly, which keeps their quality higher
