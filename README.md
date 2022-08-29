WORK IN PROGRESS, NOTHING TO SEE YET...

# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Caf.js library for processing Kafka streams

[![Build Status](https://github.com/cafjs/caf_kafka/actions/workflows/push.yml/badge.svg)](https://github.com/cafjs/caf_kafka/actions/workflows/push.yml)

The Kafka Streams API https://docs.confluent.io/platform/current/streams/index.html provides "exactly-once" processing of Kafka events, but requires that the input and output data are stored in a Kafka cluster.

Can we also provide "exactly-once" event processing when we need interactions with the external world?

For example, calling Web APIs of third-party providers, or micro-services hosted in a different cloud, or triggering actions on connected IoT devices, or notifying clients...

This Caf.js library helps you to build a reliable Kafka Gateway to do just that.

It is typically combined with the standard Kafka Streams API, providing a last  stage of the processing pipeline:

    <TopicA> -> <Kafka Streams API> -> <TopicB> -> <Kafka/Caf.js Gateway> -> <Web APIs/Microservice APIs/IoT device APIs/...>

and it can also poll external services/devices regularly, i.e., using Caf.js autonomous agents, to create events for a new Kafka topic:

    <External services/devices> -> <Kafka/Caf.js Gateway> -> <TopicA> -> <Kafka Streams API> -> <TopicB>

A challenge is to provide a reasonable throughput while respecting event ordering. The strategy of the Kafka Streams API, one logical thread per partition, is too slow when one Web API call can take 100 msec of latency or more...

Luckily, only events with the same key need to be processed in order, and we can exploit concurrency between keys in the same partition to increase throughput.

But then events can be processed out of order, making "exactly-once" event processing much more complicated...

### Our Solution

We associate a Kafka partition with one Caf.js process, and then the `caf_kafka` plugin will consume events in that partition, dispatching them to local CAs, i.e., transactional actors called Cloud Assistants, based on the event key.

CAs never block the node.js loop, and now we can process concurrently thousands of events if they have different keys.

CAs remember the offset of the last processed event in internal (checkpointed) state, filtering duplicated events.

They also serialize requests with fencing, and CAs internal state is always externally consistent after recovering from a failure.

Moreover, external actions are mediated by transactional plugins, which delay them until a request commits, and also guarantee that recovery actions are idempotent.

This means that, with the right plugins, we can extend exactly-once semantics to the external world without needing distributed transactions.

See https://www.cafjslabs.com/orchestration for details.

## API

See {@link module:caf_kafka/proxy_kafka}

## Configuration

### framework.json

See {@link module:caf_kafka/plug_kafka}

### ca.json

See {@link module:caf_kafka/plug_ca_kafka}
