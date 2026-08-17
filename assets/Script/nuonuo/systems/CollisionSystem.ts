/**
 * 碰撞检测系统（CollisionSystem）
 * 
 * 【通俗说明】判断"手指点到了哪个物品"。
 * 
 * 因为物品是画在格子里的，而格子有坐标和大小，
 * 所以"碰撞检测"其实就是：
 *   1. 拿到手指的坐标 (x, y)
 *   2. 算出它在第几行第几列
 *   3. 返回那个格子上的物品信息
 * 
 * 非常简单，就是坐标换算。
 */

import { Board } from './Board';

export class CollisionSystem {
  /** 棋盘对象引用 */
  private board: Board;

  /** 棋盘绘制的起始坐标（在画布上的位置） */
  private boardX: number = 0;
  private boardY: number = 0;

  /** 每个格子的像素大小 */
  private cellSize: number = 0;

  constructor(board: Board) {
    this.board = board;
  }

  /**
   * 更新棋盘在画布上的位置信息
   * 每次画布大小变化或关卡切换时需要调用
   * 
   * @param boardX 棋盘左上角 X 坐标
   * @param boardY 棋盘左上角 Y 坐标
   * @param cellSize 格子大小（像素）
   */
  updateLayout(boardX: number, boardY: number, cellSize: number): void {
    this.boardX = boardX;
    this.boardY = boardY;
    this.cellSize = cellSize;
  }

  /**
   * 将画布坐标转换为棋盘格坐标
   * 
   * @param canvasX 手指/鼠标在画布上的 X 坐标
   * @param canvasY 手指/鼠标在画布上的 Y 坐标
   * @returns [row, col] 或 null（如果点击在棋盘外）
   */
  canvasToGrid(canvasX: number, canvasY: number): [number, number] | null {
    // 检查是否在棋盘范围内
    if (
      canvasX < this.boardX ||
      canvasY < this.boardY ||
      canvasX >= this.boardX + this.board.cols * this.cellSize ||
      canvasY >= this.boardY + this.board.rows * this.cellSize
    ) {
      return null;
    }

    const col = Math.floor((canvasX - this.boardX) / this.cellSize);
    const row = Math.floor((canvasY - this.boardY) / this.cellSize);

    if (!this.board.isValidCell(row, col)) return null;

    return [row, col];
  }

  /**
   * 将棋盘格坐标转换为画布坐标（格子中心点）
   * 
   * @param row 行
   * @param col 列
   * @returns [centerX, centerY]
   */
  gridToCanvas(row: number, col: number): [number, number] {
    return [
      this.boardX + col * this.cellSize + this.cellSize / 2,
      this.boardY + row * this.cellSize + this.cellSize / 2,
    ];
  }

  /**
   * 获取某个格子在画布上的边界框
   * 
   * @param row 行
   * @param col 列
   * @returns { x, y, width, height }
   */
  getCellRect(row: number, col: number): { x: number; y: number; width: number; height: number } {
    return {
      x: this.boardX + col * this.cellSize,
      y: this.boardY + row * this.cellSize,
      width: this.cellSize,
      height: this.cellSize,
    };
  }

  /**
   * 检测某个画布坐标是否落在指定格子上
   * 
   * @param canvasX 画布 X
   * @param canvasY 画布 Y
   * @param row 目标行
   * @param col 目标列
   */
  isPointInCell(canvasX: number, canvasY: number, row: number, col: number): boolean {
    const rect = this.getCellRect(row, col);
    return (
      canvasX >= rect.x &&
      canvasX < rect.x + rect.width &&
      canvasY >= rect.y &&
      canvasY < rect.y + rect.height
    );
  }
}
