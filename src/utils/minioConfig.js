export function getMinioConfigFormData(form) {
  const parser = Array.isArray(form) ? form[0] : form
  return parser && parser.formData ? { ...parser.formData } : {}
}
