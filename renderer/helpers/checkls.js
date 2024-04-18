export const checkLSVal = (el, val, type = 'string', ext = false) => {
  if (typeof window === 'undefined') {
    return val;
  }
  let value;
  switch (type) {
    case 'object':
      try {
        value = JSON.parse(window.electronAPI.getItem(el));
      } catch (error) {
        window.electronAPI.setItem(el, JSON.stringify(val));
        return val;
      }
      break;
    case 'boolean':
      if (window.electronAPI.getItem(el) === null) {
        value = null;
      } else {
        value = window.electronAPI.getItem(el) === 'true';
      }
      break;

    case 'string':
    default:
      value = window.electronAPI.getItem(el);
      break;
  }

  if (value === null || (ext && !value[ext])) {
    window.electronAPI.setItem(
      el,
      type === 'string' ? val : JSON.stringify(val)
    );
    return val;
  } else {
    return value;
  }
};
