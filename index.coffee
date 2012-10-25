s = poorModule "saver"
rocks = s.list ["diamond", "amethyst"]
rocks.push "quarts"
console.log rocks.to_json()
rocks.pop()
console.log rocks.to_json()
rocks.undo()
console.log rocks.to_json()
