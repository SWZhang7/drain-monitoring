import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"
import { randomUUID } from "node:crypto"

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }))
const TABLE = "drain-monitoring-dev-DrainsTable-bcmtdxbv"

const drains = [
  { publicName: "Maxfield Avenue Storm Drain", privateName: "KGN-MAX-001", latitude: 17.9987, longitude: -76.7891, operatorEmail: "operator@floodwatch.com", height: 120 },
  { publicName: "Constant Spring Road Culvert", privateName: "KGN-CSR-001", latitude: 18.0352, longitude: -76.7955, operatorEmail: "operator@floodwatch.com", height: 150 },
  { publicName: "Half Way Tree Clock Tower Drain", privateName: "KGN-HWT-001", latitude: 17.9934, longitude: -76.7969, operatorEmail: "operator@floodwatch.com", height: 100 },
  { publicName: "Dunrobin Avenue Channel", privateName: "KGN-DUN-001", latitude: 18.0121, longitude: -76.8012, operatorEmail: "operator@floodwatch.com", height: 130 },
  { publicName: "Washington Boulevard Drain", privateName: "KGN-WBL-001", latitude: 18.0056, longitude: -76.7734, operatorEmail: "operator@floodwatch.com", height: 110 },
  { publicName: "Portmore Causeway Side Drain", privateName: "POR-CAU-001", latitude: 17.9482, longitude: -76.8831, operatorEmail: "operator@floodwatch.com", height: 90 },
  { publicName: "Gregory Park Storm Channel", privateName: "POR-GRP-001", latitude: 17.9601, longitude: -76.8912, operatorEmail: "operator@floodwatch.com", height: 100 },
  { publicName: "Spanish Town Market Drain", privateName: "STN-MKT-001", latitude: 17.9909, longitude: -76.9566, operatorEmail: "operator@floodwatch.com", height: 120 },
  { publicName: "Brunswick Avenue Culvert", privateName: "STN-BRN-001", latitude: 17.9872, longitude: -76.9489, operatorEmail: "operator@floodwatch.com", height: 140 },
  { publicName: "Brown's Town Main Street Drain", privateName: "BRT-MNS-001", latitude: 18.3919, longitude: -77.3664, operatorEmail: "gabria464@gmail.com", height: 100 },
  { publicName: "Ocho Rios Shaw Park Drain", privateName: "OCR-SHP-001", latitude: 18.4041, longitude: -77.1046, operatorEmail: "operator@floodwatch.com", height: 110 },
  { publicName: "Montego Bay Dump Road Channel", privateName: "MBJ-DMP-001", latitude: 18.4762, longitude: -77.9162, operatorEmail: "operator@floodwatch.com", height: 160 },
  { publicName: "Barnett Street Storm Drain", privateName: "MBJ-BAR-001", latitude: 18.4721, longitude: -77.9201, operatorEmail: "operator@floodwatch.com", height: 120 },
  { publicName: "Mandeville Ward Avenue Drain", privateName: "MAN-WAR-001", latitude: 18.0411, longitude: -77.5042, operatorEmail: "operator@floodwatch.com", height: 100 },
]

async function seed() {
  console.log(`Seeding ${drains.length} drains into ${TABLE}...`)

  for (const drain of drains) {
    const item = {
      D_Id: randomUUID(),
      ...drain,
      sentimentScore: 10,
      reportCount: 0,
      alertSince: null,
      alreadyAlerted: false,
      lastSeen: null,
    }
    await docClient.send(new PutCommand({ TableName: TABLE, Item: item }))
    console.log(`✓ ${item.D_Id} — ${item.publicName}`)
  }

  console.log("Done.")
}

seed().catch(console.error)
