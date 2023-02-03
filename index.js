const {Worker, Queue} = require("bullmq");

startWorkers();

async function startWorkers() {
    const queue = new Queue("TestQueue", {
        connection: {host: "bullmq-test-redis"},
    });

    await queue.add(
        "Test delayed job",
        {},
        {
            repeat: {every: 5 * 60 * 1000}, // Every 5 minutes
        }
    );

    const worker = new Worker(
        "TestQueue",
        () => {
            console.log("Job done at " + new Date().toISOString())
        },
        {
            connection: {host: "bullmq-test-redis"},
        }
    );

    worker.on("error", (err) => {
        console.error("Worker error", err);
    });
}
