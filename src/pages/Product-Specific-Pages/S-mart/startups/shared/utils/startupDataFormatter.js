export const formatAvailability = (availability) => {
  if (!availability || !availability.days || availability.days.length === 0) {
    return null;
  }

  const formatTime = (time) => {
    const [hours, mins] = time.split(':');
    const hour = parseInt(hours);
    return hour >= 12
      ? `${hour === 12 ? 12 : hour - 12}:${mins} PM`
      : `${hour}:${mins} AM`;
  };

  let timeRangeStr = '';
  if (availability.timeRange) {
    if (typeof availability.timeRange === 'string') {
      timeRangeStr = availability.timeRange;
    } else if (availability.timeRange.start && availability.timeRange.end) {
      timeRangeStr = `${formatTime(availability.timeRange.start)} - ${formatTime(availability.timeRange.end)}`;
    }
  }

  return `${availability.days.join(', ')} ${timeRangeStr}`;
};

export const processStartupData = (data, baseUrl) => {
  if (!data) return null;

  const getImageUrl = (key) => {
    if (!key) return null;
    if (key.startsWith('http')) return key;
    if (key.startsWith('blob:')) return key;
    return `${baseUrl}/smart/api/smart/file/${encodeURIComponent(key)}`;
  };

  return {
    ...data,
    logo: getImageUrl(data.logo),
    gallery: data.gallery?.map(item => ({
      ...item,
      url: getImageUrl(item.url)
    })) || [],
    team: data.team?.map(member => ({
      ...member,
      avatar: getImageUrl(member.avatar)
    })) || [],
    pitchDeck: getImageUrl(data.pitchDeck)
  };
};