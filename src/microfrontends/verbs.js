export const CMD = {
  CONNECT_MF: "CONNECT_MF"
};

export const EVT = {
  MF_CONNECTED: "MF_CONNECTED",
  ALL_MFS_CONNECTED: "ALL_MFS_CONNECTED",
  MF_ACK_SENT: mfId => `${mfId}_ACK_SENT`
};
