import { Subject } from "rxjs";
import GameState from "../enum/gameState";

export default class GameStateManager {
  gameStateChanged$: Subject<GameState> = new Subject();
}