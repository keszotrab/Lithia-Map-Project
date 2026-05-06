import { Component, HostListener } from '@angular/core';
import {
  TILE_IMG_FORMAT,
  TILE_NAME,
  TILE_SIZE_HEIGHT,
  TILE_SIZE_WIDTH,
  TILES_PER_ROW,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './map.constants';
import { Tile } from './tile.model';
import { ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
})
export class MapComponent {
  camera = { x: 0, y: 0, zoom: 1 };
  visibleTiles: Tile[] = [];
  private dragging = false;
  private lastMouse = { x: 0, y: 0 };

  ///////

  get worldTransform(): string {
    return `
      scale(${this.camera.zoom})
      translate(${-this.camera.x}px, ${-this.camera.y}px)
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

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const worldX = this.camera.x + mouseX / this.camera.zoom;
    const worldY = this.camera.y + mouseY / this.camera.zoom;

    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1; // obvious numbers? but probably add variables for that anyway (magic numbere)

    this.camera.zoom = Math.min(2.5, Math.max(0.5, this.camera.zoom * zoomDelta)); // add variables from map constraints (magic numbers are here too)

    this.camera.x = worldX - mouseX / this.camera.zoom; // this is a little wacky, tweak the numbers later
    this.camera.y = worldY - mouseY / this.camera.zoom;

    this.clampCamera();
    this.updateVisibleTiles();
  }
  //technically bug is fixed but It's not perfectly loading the Tiles
  //Not a biggie, but have to check it again
  updateVisibleTiles() {
    const viewWidth = window.innerWidth / this.camera.zoom;
    const viewHeight = window.innerHeight / this.camera.zoom;

    const startCol = Math.floor(this.camera.x / TILE_SIZE_WIDTH) - 1;
    const endCol = Math.ceil((this.camera.x + viewWidth) / TILE_SIZE_WIDTH) + 1;

    const startRow = Math.floor(this.camera.y / TILE_SIZE_HEIGHT) - 1;
    const endRow = Math.ceil((this.camera.y + viewHeight) / TILE_SIZE_HEIGHT) + 1;

    const tiles: Tile[] = [];

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
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
