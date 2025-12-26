import * as net from "net";
import NodeRSA from "node-rsa";
import { FileInput } from "../core/file/FileInput";

const loginServer = new net.Server();
const gameServer = new net.Server();

function _toArrayBuffer(buf: Buffer) {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

const _pk = new NodeRSA(
  `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCbZGkDtFsHrJVlaNhzU71xZROd15QHA7A+bdB5OZZhtKg3qmBWHXzLlFL6AIBZ
SQmIKrW8pYoaGzX4sQWbcrEhJhHGFSrT27PPvuetwUKnXT11lxUJwyHFwkpb1R/UYPAbThW+sN4Z
MFKKXT8VwePL9cQB1nd+EKyqsz2+jVt/9QIDAQABAoGAQovTtTRtr3GnYRBvcaQxAvjIV9ZUnFRm
C7Y3i1KwJhOZ3ozmSLrEEOLqTgoc7R+sJ1YzEiDKbbete11EC3gohlhW56ptj0WDf+7ptKOgqiEy
Kh4qt1sYJeeGz4GiiooJoeKFGdtk/5uvMR6FDCv6H7ewigVswzf330Q3Ya7+jYECQQERBxsga6+5
x6IofXyNF6QuMqvuiN/pUgaStUOdlnWBf/T4yUpKvNS1+I4iDzqGWOOSR6RsaYPYVhj9iRABoKyx
AkEAkbNzB6vhLAWht4dUdGzaREF3p4SwNcu5bJRa/9wCLSHaS9JaTq4lljgVPp1zyXyJCSCWpFnl
0WvK3Qf6nVBIhQJBANS7rK8+ONWQbxENdZaZ7Rrx8HUTwSOS/fwhsGWBbl1Qzhdq/6/sIfEHkfeH
1hoH+IlpuPuf21MdAqvJt+cMwoECQF1LyBOYduYGcSgg6u5mKVldhm3pJCA+ZGxnjuGZEnet3qeA
eb05++112fyvO85ABUun524z9lokKNFh45NKLjUCQGshzV43P+RioiBhtEpB/QFzijiS4L2HKNu1
tdhudnUjWkaf6jJmQS/ppln0hhRMHlk9Vus/bPx7LtuDuo6VQDo=
-----END RSA PRIVATE KEY-----`,
  "private",
  { environment: "node" },
);

const messageFromTheClient = (data: Buffer) => {
  console.log("messageFromTheClient", data.length, data);
  console.log(JSON.stringify([...data].map((n) => n.toString(16))));

  const fin = FileInput.fromBuffer(data);
  const log: any = {};

  // MAXSIZE = 24590
  log.realSize = fin.data.size;
  log.bodySize = fin.getU16();
  log.checksum = fin.getU32();

  // first message
  log.opcode = fin.getU8();
  log.os = fin.getU16();
  log.protocolVersion = fin.getU16();
  log.clientVersion = fin.getU32(); // 4
  log.contentRevision = fin.getU16(); // 2
  log.contentRevisionZero = fin.getU16(); // 1
  log.sprSignature = fin.getU32();
  log.picSignature = fin.getU32();
  log.previewStateZero = fin.getU8(); // 1

  console.log(log);
};

const messageFromTheServer = (data: Buffer) => {
  console.log("messageFromTheServer", data.length, data);
  console.log(JSON.stringify([...data].map((n) => n.toString(16))));

  const fin = FileInput.fromBuffer(data);
  const size = fin.getU16();
  console.log({ size });
};

loginServer.on("connection", (proxySocket) => {
  const realSocket = net.createConnection({ port: 7173, host: "localhost" });

  proxySocket.on("data", (data) => {
    messageFromTheClient(data);
    realSocket.write(data);
  });

  realSocket.on("data", (data) => {
    messageFromTheServer(data);
    proxySocket.write(data);
  });
});

gameServer.on("connection", (proxySocket) => {
  const realSocket = net.createConnection({ port: 7174, host: "localhost" });

  proxySocket.on("data", (data) => {
    messageFromTheClient(data);
    realSocket.write(data);
  });

  realSocket.on("data", (data) => {
    messageFromTheServer(data);
    proxySocket.write(data);
  });
});

gameServer.on("connection", (event) => {
  console.log("gameServer connection", event);
});

loginServer.listen(7171);
gameServer.listen(7172);
