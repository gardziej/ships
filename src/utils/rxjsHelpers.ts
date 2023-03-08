import { map } from "rxjs/operators";
import Vector2 from "../class/vector2";

// export function mapMouseEventToPosition(mouseEvent: MouseEvent) {
//   return pipe(
//     map((mouseEvent: MouseEvent) => new Vector2(mouseEvent.offsetX, mouseEvent.offsetY)
//     )
//   )
// }

export function mapMouseEventToPosition() {
  return map((mouseEvent: MouseEvent) => new Vector2(mouseEvent.offsetX, mouseEvent.offsetY));
}