export function getErrMsg(e) {
  return e?.response?.data?.message || e?.message || "Có lỗi xảy ra";
}
