import { Resource } from "sst";
import { Example } from "@drain-monitoring/core/example";

console.log(`${Example.hello()} Linked to ${Resource.MyBucket.name}.`);
