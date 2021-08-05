// function TreeNode(val, left, right) {
//   this.val = (val===undefined ? 0 : val)
//   this.left = (left===undefined ? null : left)
//   this.right = (right===undefined ? null : right)
// }

class BrianTree {
  val: string;
  left: BrianTree | null;
  right: BrianTree | null;
  constructor(val?: string, left?: BrianTree | null, right?: BrianTree) {
    this.val = (val===undefined ? '' : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
  }
}

export default BrianTree;