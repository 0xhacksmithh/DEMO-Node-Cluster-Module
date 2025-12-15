import express from "express";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";

const numCPUs = availableParallelism();

console.log(`Cores :: ${numCPUs}`);

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();

  app.get("/", (req, res) => {
    // lets do some work
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      sum = sum + i;
    }

    //  console.log(`Number :: ${sum}`);

    res.status(200).send({
      message: "HIII",
    });
  });

  app.listen(3000, () => {
    console.log("Server running on port : 3000....");
  });

  console.log(`Worker ${process.pid} started`);
}

/*
10 connections


┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬───────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max   │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼───────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.09 ms │ 15 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴───────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────────┬──────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg       │ Stdev    │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼─────────┤
│ Req/Sec   │ 25,231  │ 25,231  │ 29,215  │ 29,855  │ 28,114.19 │ 1,835.25 │ 25,220  │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼─────────┤
│ Bytes/Sec │ 6.38 MB │ 6.38 MB │ 7.39 MB │ 7.55 MB │ 7.11 MB   │ 464 kB   │ 6.38 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────────┴──────────┴─────────┘
*/
