export enum ResultScenario {
  BOTH_INCORRECT,
  BOTH_NOT_ANSWERED,
  RED_QUICKER_CORRECT,
  BLUE_QUICKER_CORRECT,
  RED_CORRECT_BLUE_INCORRECT,
  BLUE_CORRECT_RED_INCORRECT,
  RED_CORRECT_BLUE_NOT_ANSWERED,
  BLUE_CORRECT_RED_NOT_ANSWERED,
  RED_INCORRECT_BLUE_NOT_ANSWERED,
  BLUE_INCORRECT_RED_NOT_ANSWERED,
}

export enum EventType {
  GAME_START = "GAME_START",
  GAME_END = "GAME_END",
  ROUND_START = "ROUND_START",
  ROUND_END = "ROUND_END",
}
