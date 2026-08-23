#!/bin/zsh
# $1 = body file, $2 = out file, $3 = preview width, $4 = preview height
{
  cat <<'HEAD'
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
HEAD
  cat _helmet.txt
  cat "$1"
  cat <<'TAIL'
</x-dc>
TAIL
  printf '<script data-dc-script data-props=%s{"theme":{"editor":"enum","options":["light","dark"],"default":"light","section":"Theme"},"$preview":{"width":%s,"height":%s}}%s>\n' "'" "$3" "$4" "'"
  cat <<'LOGIC'
class Component extends DCLogic {
  renderVals() {
    return { theme: this.props.theme ?? 'light' };
  }
}
</script>
</body>
</html>
LOGIC
} > "$2"
echo "wrote $2"
