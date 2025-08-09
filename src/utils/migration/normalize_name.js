export function normalizeServiceName(rawName, nameChange) {
  let name = rawName.trim().replace(/[^a-zA-Z0-9-_]/g, '-')
  if (!/^[a-zA-Z]/.test(name)) {
    name = `${nameChange}-` + name
  }
  return name
}