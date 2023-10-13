import { RoomDTO } from "../src/dto/game-dto";
import { getResultScenario } from "../src/service/socket-service";

describe("getResultScenario", () => {
  test("BOTH_INCORRECT", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: new Date(new Date().getTime() + 1000),
      p2Time: new Date(new Date().getTime() + 1200),
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: "C",
      p2answer: "B",
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(0); // Assuming ResultScenario.BOTH_INCORRECT is 0
  });

  test("BOTH_NOT_ANSWERED", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: null,
      p2Time: null,
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: null,
      p2answer: null,
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(1); // Assuming ResultScenario.BOTH_NOT_ANSWERED is 1
  });

  test("P1_QUICKER_CORRECT", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: new Date(new Date().getTime() + 500),
      p2Time: new Date(new Date().getTime() + 1000),
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: "A",
      p2answer: "A",
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(2); // Assuming ResultScenario.P1_QUICKER_CORRECT is 2
  });

  test("P2_QUICKER_CORRECT", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: new Date(new Date().getTime() + 1000),
      p2Time: new Date(new Date().getTime() + 500),
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: "A",
      p2answer: "A",
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(3); // Assuming ResultScenario.P2_QUICKER_CORRECT is 3
  });

  test("P1_CORRECT_P2_INCORRECT", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: new Date(),
      p2Time: new Date(),
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: "A",
      p2answer: "B",
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(4); // Assuming ResultScenario.P1_CORRECT_P2_INCORRECT is 4
  });

  test("P2_CORRECT_P1_INCORRECT", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: new Date(),
      p2Time: new Date(),
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: "B",
      p2answer: "A",
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(5); // Assuming ResultScenario.P2_CORRECT_P1_INCORRECT is 5
  });

  test("P1_CORRECT_P2_NOT_ANSWERED", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: new Date(),
      p2Time: null,
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: "A",
      p2answer: null,
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(6); // Assuming ResultScenario.P1_CORRECT_P2_NOT_ANSWERED is 6
  });

  test("P2_CORRECT_P1_NOT_ANSWERED", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: null,
      p2Time: new Date(),
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: null,
      p2answer: "A",
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(7); // Assuming ResultScenario.P2_CORRECT_P1_NOT_ANSWERED is 7
  });

  test("P1_INCORRECT_P2_NOT_ANSWERED", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: new Date(),
      p2Time: null,
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: "B",
      p2answer: null,
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(8); // Assuming ResultScenario.P1_INCORRECT_P2_NOT_ANSWERED is 8
  });

  test("P2_INCORRECT_P1_NOT_ANSWERED", async () => {
    const room: RoomDTO = {
      name: "Room1",
      p1Time: null,
      p2Time: new Date(),
      initTime: new Date(),
      count: 0,
      p1Count: 0,
      p2Count: 0,
      p1answer: null,
      p2answer: "B",
      timer: null,
      questions: [],
    };
    const result = await getResultScenario(room);
    expect(result).toEqual(9); // Assuming ResultScenario.P2_INCORRECT_P1_NOT_ANSWERED is 9
  });

  // Add more test cases for other scenarios if needed...
});
