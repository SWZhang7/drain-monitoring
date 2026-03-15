export const drainsTable = new sst.aws.Dynamo("Drains", {
  fields: {
    D_Id: "string",
  },
  primaryIndex: { hashKey: "D_Id" },
})

// Schema: D_Id (PK), publicName, privateName, latitude, longitude, sentimentScore (0-10)

export const drainMessagesTable = new sst.aws.Dynamo("DrainMessages", {
  fields: {
    D_Id: "string",
    Event_Key: "string",
  },
  primaryIndex: { hashKey: "D_Id", rangeKey: "Event_Key" },
})
