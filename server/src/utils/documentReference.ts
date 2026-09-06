export function getDocumentReferenceId(value: unknown) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    const candidate = value as {
      _id?: { toString(): string };
      id?: unknown;
      toString?: () => string;
    };

    if (typeof candidate.id === 'string') {
      return candidate.id;
    }

    if (typeof candidate._id?.toString === 'function') {
      return candidate._id.toString();
    }

    if (
      typeof candidate.toString === 'function' &&
      candidate.toString !== Object.prototype.toString
    ) {
      return candidate.toString();
    }
  }

  return String(value);
}
