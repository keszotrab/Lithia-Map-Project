import { Component, HostListener } from '@angular/core';
import { TILE_SIZE } from './map.constants';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent {
  camera = { x: 0, y: 0, zoom: 1 };
  visibleTiles: any[] = [];

  private dragging = false;
  private lastMouse = { x: 0, y: 0 };

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

    this.updateVisibleTiles();
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();

    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
    this.camera.zoom *= zoomDelta;

    this.camera.zoom = Math.min(2.5, Math.max(0.5, this.camera.zoom));
    this.updateVisibleTiles();
  }

  updateVisibleTiles() {
    const startCol = Math.floor(this.camera.x / TILE_SIZE);
    const startRow = Math.floor(this.camera.y / TILE_SIZE);

    const cols = Math.ceil(window.innerWidth / (TILE_SIZE * this.camera.zoom)) + 1;
    const rows = Math.ceil(window.innerHeight / (TILE_SIZE * this.camera.zoom)) + 1;

    const tiles = [];

    for (let r = startRow; r < startRow + rows; r++) {
      for (let c = startCol; c < startCol + cols; c++) {
        tiles.push({
          x: c * TILE_SIZE,
          y: r * TILE_SIZE,
          src: `assets/tiles/0/${r}_${c}.jpg`
        });
      }
    }

    this.visibleTiles = tiles;
  }

  ngOnInit() {
    this.updateVisibleTiles();
  }
}
