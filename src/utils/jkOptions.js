export function optionList(response) {
  return Array.isArray(response) ? response : (response && response.data) || []
}
