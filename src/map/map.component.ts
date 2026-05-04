import { Component, HostListener } from '@angular/core';
import { TILE_IMG_FORMAT, TILE_NAME, TILE_SIZE_HEIGHT, TILE_SIZE_WIDTH, TILES_PER_ROW, WORLD_HEIGHT, WORLD_WIDTH } from './map.constants';
import { Tile } from './tile.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone:true
})
export class MapComponent {
  camera = { x: 0, y: 0, zoom: 1 };
  visibleTiles: Tile[] = [];
  private dragging = false;
  private lastMouse = { x: 0, y: 0 };
  

  ///////

  get worldTransform(): string {
    return `
      translate(${-this.camera.x}px, ${-this.camera.y}px)
      scale(${this.camera.zoom})
    `;
  }

  startDrag(event: MouseEvent) {
    this.dragging = true;
    this.lastMouse = { x: event.clientX, y: event.clientY };
  }

  @HostListener('window:mouseup')
  stopDrag() {
    this.dragging = false;
  }

  @HostListener('window:mousemove', ['$event'])
  onMove(event: MouseEvent) {
    if (!this.dragging) return;

    const dx = (event.clientX - this.lastMouse.x) / this.camera.zoom;
    const dy = (event.clientY - this.lastMouse.y) / this.camera.zoom;

    this.camera.x -= dx;

    this.camera.y -= dy;

    this.lastMouse = { x: event.clientX, y: event.clientY };

    this.clampCamera();
    this.updateVisibleTiles();
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();

    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
    this.camera.zoom *= zoomDelta;

    this.camera.zoom = Math.min(2.5, Math.max(0.5, this.camera.zoom));

    this.clampCamera();
    this.updateVisibleTiles();
  }

  updateVisibleTiles() {
    const startCol = Math.floor(this.camera.x / TILE_SIZE_WIDTH);
    const startRow = Math.floor(this.camera.y / TILE_SIZE_HEIGHT);

    const cols = Math.ceil(window.innerWidth / (TILE_SIZE_WIDTH * this.camera.zoom)) + 2; //1 or 2 idk
    const rows = Math.ceil(window.innerHeight / (TILE_SIZE_HEIGHT * this.camera.zoom)) + 2;

    const tiles = [];

    for (let r = startRow; r < startRow + rows; r++) {
      for (let c = startCol; c < startCol + cols; c++) {
        if (
          c < 0 ||
          r < 0 ||
          c * TILE_SIZE_WIDTH >= WORLD_WIDTH ||
          r * TILE_SIZE_HEIGHT >= WORLD_HEIGHT
        )
          continue;

        const index = r * TILES_PER_ROW + c + 1;

        tiles.push({
          x: c * TILE_SIZE_WIDTH,
          y: r * TILE_SIZE_HEIGHT,
          src: `assets/tiles/${TILE_NAME}${index}${TILE_IMG_FORMAT}`,
          row: r,
          col: c,
        });
      }
    }

    this.visibleTiles = tiles;
  }

  ngOnInit() {
    this.updateVisibleTiles();
  }

  clampCamera() {
    const maxX = WORLD_WIDTH - window.innerWidth / this.camera.zoom;
    const maxY = WORLD_HEIGHT - window.innerHeight / this.camera.zoom;

    this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
    this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
  }
}
