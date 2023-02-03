This repository demonstrates the problem I get with BullMQ repeatable jobs when connection to Redis is temporarily lost.

## To start application

* `git clone` this repository
* `docker compose up`

To simulate the temporary loss of connection to Redis:

* `docker compose stop bullmq-test-redis`
* wait for 10 seconds
* `docker compose start bullmq-test-redis`

## Expected behavior

A repeatable job should be executed ("Job done" logged to console) every 5 minutes. If you simulate the temporary loss of connection to Redis, the job should still be executed on the next schedule.

For example:
```
2023-02-03T12:00:00.000Z: Job done
2023-02-03T12:00:05.000Z: Job done
2023-02-03T12:00:10.000Z: Job done
2023-02-03T12:00:13.000Z: (Temporary loss of connection to Redis lasting 10 seconds)
2023-02-03T12:00:15.000Z: Job done
2023-02-03T12:00:20.000Z: Job done
```

## Actual behavior:

If the connection to Redis is lost, the repeatable job is eventually executed, but not on the next schedule. Instead, it is executed 5 minutes after the connection to Redis problem happens.


For example:
```
2023-02-03T12:00:00.000Z: Job done
2023-02-03T12:00:05.000Z: Job done
2023-02-03T12:00:10.000Z: Job done
2023-02-03T12:00:13.000Z: (Temporary loss of connection to Redis lasting 10 seconds)
2023-02-03T12:00:18.000Z: Job done <--- This job is 3 minutes late. With longer repeat intervals it would be hours of delay.
2023-02-03T12:00:20.000Z: Job done
2023-02-03T12:00:25.000Z: Job done
```

## Additional information:

This is the actual console output from the application including the temporary loss of connection to Redis:

```
➜  bullmq-test docker compose up
[+] Running 2/0
 ⠿ Container bullmq-test        Created                                                                                                                                0.1s
 ⠿ Container bullmq-test-redis  Created                                                                                                                                0.1s
Attaching to bullmq-test, bullmq-test-redis
bullmq-test-redis  | 1:C 03 Feb 2023 06:57:36.334 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
bullmq-test-redis  | 1:C 03 Feb 2023 06:57:36.335 # Redis version=7.0.7, bits=64, commit=00000000, modified=0, pid=1, just started
bullmq-test-redis  | 1:C 03 Feb 2023 06:57:36.335 # Warning: no config file specified, using the default config. In order to specify a config file use redis-server /path/to/redis.conf
bullmq-test-redis  | 1:M 03 Feb 2023 06:57:36.338 * monotonic clock: POSIX clock_gettime
bullmq-test-redis  | 1:M 03 Feb 2023 06:57:36.350 * Running mode=standalone, port=6379.
bullmq-test-redis  | 1:M 03 Feb 2023 06:57:36.350 # Server initialized
bullmq-test-redis  | 1:M 03 Feb 2023 06:57:36.361 * Ready to accept connections
bullmq-test        | 
bullmq-test        | > bullmq-test@1.0.0 start
bullmq-test        | > node index.js
bullmq-test        | 
bullmq-test        | Job done at 2023-02-03T07:00:00.089Z
bullmq-test        | Job done at 2023-02-03T07:05:00.126Z
bullmq-test-redis  | 1:M 03 Feb 2023 07:09:07.348 * 100 changes in 300 seconds. Saving...
bullmq-test-redis  | 1:M 03 Feb 2023 07:09:07.385 * Background saving started by pid 31
bullmq-test-redis  | 31:C 03 Feb 2023 07:09:07.411 * DB saved on disk
bullmq-test-redis  | 31:C 03 Feb 2023 07:09:07.412 * Fork CoW for RDB: current 2 MB, peak 2 MB, average 2 MB
bullmq-test-redis  | 1:M 03 Feb 2023 07:09:07.489 * Background saving terminated with success
bullmq-test        | Job done at 2023-02-03T07:10:00.099Z
bullmq-test-redis  | 1:signal-handler (1675408383) Received SIGTERM scheduling shutdown...
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:03.766 # User requested shutdown...
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:03.767 * Saving the final RDB snapshot before exiting.
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:03.777 * DB saved on disk
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:03.777 # Redis is now ready to exit, bye bye...
bullmq-test        | Error: connect ECONNREFUSED 192.168.96.2:6379
bullmq-test        |     at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16) {
bullmq-test        |   errno: -111,
bullmq-test        |   code: 'ECONNREFUSED',
bullmq-test        |   syscall: 'connect',
bullmq-test        |   address: '192.168.96.2',
bullmq-test        |   port: 6379
bullmq-test        | }
bullmq-test        | Worker error Error: connect ECONNREFUSED 192.168.96.2:6379
bullmq-test        |     at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16) {
bullmq-test        |   errno: -111,
bullmq-test        |   code: 'ECONNREFUSED',
bullmq-test        |   syscall: 'connect',
bullmq-test        |   address: '192.168.96.2',
bullmq-test        |   port: 6379
bullmq-test        | }
bullmq-test        | Worker error Error: connect ECONNREFUSED 192.168.96.2:6379
bullmq-test        |     at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16) {
bullmq-test        |   errno: -111,
bullmq-test        |   code: 'ECONNREFUSED',
bullmq-test        |   syscall: 'connect',
bullmq-test        |   address: '192.168.96.2',
bullmq-test        |   port: 6379
bullmq-test        | }
bullmq-test        | Error: connect ECONNREFUSED 192.168.96.2:6379
bullmq-test        |     at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16) {
bullmq-test        |   errno: -111,
bullmq-test        |   code: 'ECONNREFUSED',
bullmq-test        |   syscall: 'connect',
bullmq-test        |   address: '192.168.96.2',
bullmq-test        |   port: 6379
bullmq-test        | }
bullmq-test        | Worker error Error: connect ECONNREFUSED 192.168.96.2:6379
bullmq-test        |     at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16) {
bullmq-test        |   errno: -111,
bullmq-test        |   code: 'ECONNREFUSED',
bullmq-test        |   syscall: 'connect',
bullmq-test        |   address: '192.168.96.2',
bullmq-test        |   port: 6379
bullmq-test        | }
bullmq-test        | Worker error Error: connect ECONNREFUSED 192.168.96.2:6379
bullmq-test        |     at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16) {
bullmq-test        |   errno: -111,
bullmq-test        |   code: 'ECONNREFUSED',
bullmq-test        |   syscall: 'connect',
bullmq-test        |   address: '192.168.96.2',
bullmq-test        |   port: 6379
bullmq-test        | }
bullmq-test-redis exited with code 0
bullmq-test-redis exited with code 0
bullmq-test        | Error: connect ETIMEDOUT
bullmq-test        |     at Socket.<anonymous> (/app/node_modules/ioredis/built/Redis.js:170:41)
bullmq-test        |     at Object.onceWrapper (node:events:627:28)
bullmq-test        |     at Socket.emit (node:events:513:28)
bullmq-test        |     at Socket._onTimeout (node:net:570:8)
bullmq-test        |     at listOnTimeout (node:internal/timers:569:17)
bullmq-test        |     at process.processTimers (node:internal/timers:512:7) {
bullmq-test        |   errorno: 'ETIMEDOUT',
bullmq-test        |   code: 'ETIMEDOUT',
bullmq-test        |   syscall: 'connect'
bullmq-test        | }
bullmq-test        | Worker error Error: connect ETIMEDOUT
bullmq-test        |     at Socket.<anonymous> (/app/node_modules/ioredis/built/Redis.js:170:41)
bullmq-test        |     at Object.onceWrapper (node:events:627:28)
bullmq-test        |     at Socket.emit (node:events:513:28)
bullmq-test        |     at Socket._onTimeout (node:net:570:8)
bullmq-test        |     at listOnTimeout (node:internal/timers:569:17)
bullmq-test        |     at process.processTimers (node:internal/timers:512:7) {
bullmq-test        |   errorno: 'ETIMEDOUT',
bullmq-test        |   code: 'ETIMEDOUT',
bullmq-test        |   syscall: 'connect'
bullmq-test        | }
bullmq-test        | Worker error Error: connect ETIMEDOUT
bullmq-test        |     at Socket.<anonymous> (/app/node_modules/ioredis/built/Redis.js:170:41)
bullmq-test        |     at Object.onceWrapper (node:events:627:28)
bullmq-test        |     at Socket.emit (node:events:513:28)
bullmq-test        |     at Socket._onTimeout (node:net:570:8)
bullmq-test        |     at listOnTimeout (node:internal/timers:569:17)
bullmq-test        |     at process.processTimers (node:internal/timers:512:7) {
bullmq-test        |   errorno: 'ETIMEDOUT',
bullmq-test        |   code: 'ETIMEDOUT',
bullmq-test        |   syscall: 'connect'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Worker error Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test        | Error: getaddrinfo ENOTFOUND bullmq-test-redis
bullmq-test        |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26) {
bullmq-test        |   errno: -3008,
bullmq-test        |   code: 'ENOTFOUND',
bullmq-test        |   syscall: 'getaddrinfo',
bullmq-test        |   hostname: 'bullmq-test-redis'
bullmq-test        | }
bullmq-test-redis  | 1:C 03 Feb 2023 07:13:24.173 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
bullmq-test-redis  | 1:C 03 Feb 2023 07:13:24.174 # Redis version=7.0.7, bits=64, commit=00000000, modified=0, pid=1, just started
bullmq-test-redis  | 1:C 03 Feb 2023 07:13:24.174 # Warning: no config file specified, using the default config. In order to specify a config file use redis-server /path/to/redis.conf
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.178 * monotonic clock: POSIX clock_gettime
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.187 * Running mode=standalone, port=6379.
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.188 # Server initialized
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.200 * Loading RDB produced by version 7.0.7
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.201 * RDB age 21 seconds
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.201 * RDB memory usage when created 1.62 Mb
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.206 * Done loading RDB, keys loaded: 10, keys expired: 1.
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.207 * DB loaded from disk: 0.010 seconds
bullmq-test-redis  | 1:M 03 Feb 2023 07:13:24.207 * Ready to accept connections
bullmq-test        | Job done at 2023-02-03T07:18:26.834Z
bullmq-test        | Job done at 2023-02-03T07:20:00.101Z
bullmq-test        | Job done at 2023-02-03T07:25:00.092Z
bullmq-test-redis  | 1:M 03 Feb 2023 07:25:00.179 * 100 changes in 300 seconds. Saving...
bullmq-test-redis  | 1:M 03 Feb 2023 07:25:00.210 * Background saving started by pid 31
bullmq-test-redis  | 31:C 03 Feb 2023 07:25:00.234 * DB saved on disk
bullmq-test-redis  | 31:C 03 Feb 2023 07:25:00.235 * Fork CoW for RDB: current 4 MB, peak 4 MB, average 3 MB
bullmq-test-redis  | 1:M 03 Feb 2023 07:25:00.314 * Background saving terminated with success
bullmq-test        | Job done at 2023-02-03T07:30:00.065Z
bullmq-test        | Job done at 2023-02-03T07:35:00.037Z
```
