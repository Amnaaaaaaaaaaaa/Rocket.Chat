async function handleVoipEvent(eventType, roomId, comment, user) {
  return { success: true, rid: roomId };
}

const VoipClientEvents = {
  VOIP_CALL_STARTED: 'voip-call-started'
};

module.exports = { handleVoipEvent, VoipClientEvents };
