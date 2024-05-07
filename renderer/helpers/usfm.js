const getText = (verseObject) => {
  return verseObject.text || verseObject.nextChar || '';
};

// +
const getFootnote = (verseObject) => {
  return '<sup>' + verseObject.content + '</sup>'; //TODO переделать
};

// +
const getMilestone = (verseObject, showUnsupported) => {
  const { tag, children } = verseObject;

  switch (tag) {
    case 'k':
      return children
        .map((child) => getObject(child, showUnsupported))
        .join(' ');
    case 'zaln':
      if (children.length === 1 && children[0].type === 'milestone') {
        return getObject(children[0], showUnsupported);
      } else {
        return getAlignedWords(children);
      }
    default:
      return '';
  }
};

// +
const getAlignedWords = (verseObjects) => {
  return verseObjects
    .map((verseObject) => {
      return getWord(verseObject);
    })
    .join('');
};

// +
const getSection = (verseObject) => {
  return verseObject.content;
};

// +
const getUnsupported = (verseObject) => {
  return '***' + (verseObject.content || verseObject.text) + '***';
};

// +
const getWord = (verseObject) => {
  return verseObject.text || verseObject.content;
};
const getVerseText = (verseObjects, showUnsupported = false) => {
  return verseObjects
    .map((verseObject) => getObject(verseObject, showUnsupported))
    .join('');
};

const getObject = (verseObject, showUnsupported) => {
  const { type } = verseObject;
  switch (type) {
    case 'quote':
    case 'text':
      return getText(verseObject);
    case 'milestone':
      return getMilestone(verseObject, showUnsupported);
    case 'word':
      if (verseObject.strong) {
        return getAlignedWords([verseObject]);
      } else {
        return getWord(verseObject);
      }
    case 'section':
      return getSection(verseObject);
    case 'paragraph':
      return '\n';
    case 'footnote':
      return getFootnote(verseObject);
    default:
      if (showUnsupported) {
        return getUnsupported(verseObject);
      } else {
        return '';
      }
  }
};
export const parseChapter = (chapter) => {
  let resultChapter = Object.entries(chapter);
  return resultChapter.map((el) => {
    return { verse: el[0], text: getVerseText(el[1].verseObjects, false) };
  });
};

export const convertToUsfm = ({ jsonChapters, book, project }) => {
  if (!jsonChapters || !book || !project) {
    return;
  }

  const capitalize = (text) => {
    if (!text) {
      return '';
    }
    if (text.search(/\d/) === 0) {
      text = text.split('');
      text[1] = text[1].toUpperCase();
      text = text.join('');
      return text;
    } else {
      return text[0].toUpperCase() + text.slice(1);
    }
  };
  const { h, toc1, toc2, toc3, mt } = book?.properties?.scripture;

  const headers = [
    {
      tag: 'id',
      content: `${book?.code.toUpperCase()} ${project?.code.toUpperCase()} ${
        project?.language.code
      }_${capitalize(project?.language?.orig_name)}_${
        project?.title
      } ${Date()} v-cana`,
    },
    {
      tag: 'usfm',
      content: '3.0',
    },
    {
      tag: 'ide',
      content: 'UTF-8',
    },
    {
      tag: 'h',
      content: h,
    },
    {
      tag: 'toc1',
      content: toc1,
    },
    {
      tag: 'toc2',
      content: toc2,
    },
    {
      tag: 'toc3',
      content: toc3,
    },
    {
      tag: 'mt',
      content: mt,
    },
    {
      tag: 'cl',
      content: book?.properties?.scripture?.chapter_label,
    },
  ];
  const chapters = {};
  if (jsonChapters.length > 0) {
    jsonChapters.forEach((chapter) => {
      const oneChapter = {};
      if (chapter.text) {
        for (const [num, verse] of Object.entries(chapter.text)) {
          oneChapter[num] = {
            verseObjects: [{ type: 'text', text: verse ? verse + '\n' : '' }],
          };
        }
        oneChapter['front'] = {
          verseObjects: [{ type: 'paragraph', tag: 'p', nextChar: '\n' }],
        };
      }
      chapters[chapter.num] = oneChapter;
    });
  }
  const contentUsfm = usfm.toUSFM(
    { chapters, headers },
    { forcedNewLines: true }
  );
  return contentUsfm;
};
