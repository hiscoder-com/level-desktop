function Alphabet({ alphabet, setCurrentPage, setSearchQuery, disabled }) {
  const getAlphabetGroup = (char) => {
    const code = char.charCodeAt(0)

    if (code >= 0x0041 && code <= 0x007a) {
      return 'latin'
    }
    if (code >= 0x0400 && code <= 0x04ff) {
      return 'cyrillic'
    }
    if (code >= 0x0410 && code <= 0x044f) {
      return 'ukrainian'
    }
    if (code >= 0x0600 && code <= 0x06ff) {
      return 'arabic'
    }
    if (code >= 0x0980 && code <= 0x09ff) {
      return 'bengali'
    }
    if (code >= 0x0a00 && code <= 0x0a7f) {
      return 'gurmukhi'
    }
    if (code >= 0x0a80 && code <= 0x0aff) {
      return 'gujarati'
    }
    if (code >= 0x0b00 && code <= 0x0b7f) {
      return 'oriya'
    }
    if (code >= 0x0b80 && code <= 0x0bff) {
      return 'tamil'
    }
    if (code >= 0x0c00 && code <= 0x0c7f) {
      return 'telugu'
    }
    if (code >= 0x0c80 && code <= 0x0cff) {
      return 'kannada'
    }
    if (code >= 0x0d00 && code <= 0x0d7f) {
      return 'malayalam'
    }
    if (code >= 0x0d80 && code <= 0x0dff) {
      return 'sinhala'
    }
    if (code >= 0x0e00 && code <= 0x0e7f) {
      return 'thai'
    }
    if (code >= 0x0e80 && code <= 0x0eff) {
      return 'lao'
    }
    if (code >= 0x1100 && code <= 0x11ff) {
      return 'hangul'
    }
    if (code >= 0x4e00 && code <= 0x9fff) {
      return 'chinese'
    }
    if (code >= 0x3040 && code <= 0x309f) {
      return 'hiragana'
    }
    if (code >= 0x30a0 && code <= 0x30ff) {
      return 'katakana'
    }
    if (code >= 0x0600 && code <= 0x06ff) {
      return 'arabic'
    }
    if (code >= 0x0620 && code <= 0x064a) {
      return 'arabic'
    }
    if (code >= 0x0680 && code <= 0x06ff) {
      return 'arabic'
    }
    if (code >= 0x0a80 && code <= 0x0aff) {
      return 'gujarati'
    }
    if (code >= 0xaa00 && code <= 0xaa5f) {
      return 'cham'
    }
    if (code >= 0xa800 && code <= 0xa82f) {
      return 'javanese'
    }
    if (code >= 0xa900 && code <= 0xa97f) {
      return 'kayah_li'
    }
    if (code >= 0x1200 && code <= 0x137f) {
      return 'ethiopic'
    }
    if (code >= 0x18b0 && code <= 0x18ff) {
      return 'mongolian'
    }
    if (code >= 0x2d00 && code <= 0x2d2f) {
      return 'georgian'
    }

    return 'other'
  }

  return (
    <div className="flex flex-wrap py-3 px-4 bg-th-secondary-100 rounded-lg w-full font-bold">
      {alphabet.map((letter, index) => (
        <div key={letter}>
          {index > 0 &&
            getAlphabetGroup(letter) !== getAlphabetGroup(alphabet[index - 1]) && (
              <span key={`separator-${index}`}>|</span>
            )}
          <button
            onClick={() => {
              setCurrentPage(0)
              setSearchQuery(letter.toLowerCase())
            }}
            className="px-1.5 cursor-pointer hover:opacity-50"
            key={letter}
            disabled={disabled}
          >
            {letter}
          </button>
        </div>
      ))}
    </div>
  )
}
export default Alphabet
