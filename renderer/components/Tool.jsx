import Audio from "./Audio";
import Bible from "./Bible";
import BlindEditor from "./BlindEditor";
import Dictionary from "./Dictionary";
import Editor from "./Editor";
import Info from "./Info";
import PersonalNotes2 from "./PersonalNotes2";
import TN from "./TN";
import TQ from "./TQ";
import TWL from "./TWL";

function Tool({ config, toolName }) {
  let CurrentTool;
  const title = toolName;

  switch (toolName) {
    case "bible":
      CurrentTool = Bible;
      break;

    // case 'OBS Translation Questions':
    // case 'TSV OBS Translation Questions':
    //   CurrentTool = TQ;

    //   config.resource.bookPath = config.resource.manifest.projects[0]?.path;

    //   url = '/api/git/obs-tq';
    //   break;

    // case 'OBS Translation Notes':
    // case 'TSV OBS Translation Notes':
    //   CurrentTool = OBSTN;

    //   config.resource.bookPath = config.resource.manifest.projects[0]?.path;

    //   url = '/api/git/obs-tn';
    //   break;

    case "twl":
      CurrentTool = TWL;
      break;

    case "tn":
      CurrentTool = TN;
      break;

    case "tq":
      CurrentTool = TQ;
      break;

    // case 'Open Bible Stories':
    //   CurrentTool = Bible;

    //   config.resource.bookPath = config.resource.manifest.projects[0]?.path;

    //   url = '/api/git/obs';
    //   break;

    case "editor":
      CurrentTool = Editor;
      break;

    case "blindEditor":
      CurrentTool = BlindEditor;
      break;

    case "personalNotes":
      CurrentTool = PersonalNotes2;
      break;

    case "audio":
      CurrentTool = Audio;
      break;

    case "dictionary":
      CurrentTool = Dictionary;
      break;

    case "info":
      CurrentTool = Info;
      break;

    default:
      return <div>{"WrongResource"}</div>;
  }
  return (
    <>
      <div className="pt-2.5 px-4 h-10 font-bold bg-blue-300 rounded-t-lg truncate">
        {/* {![
          'translate',
          'commandTranslate',
          'draftTranslate',
          'teamNotes',
          'personalNotes',
          'audio',
          'dictionary',
        ].includes(toolName) &&
          `${t(`books:${config?.reference?.book}`)} ${
            config?.reference?.chapter
          }, `} */}
        {title}
      </div>
      <div className="adaptive-card">
        <div className="h-full p-4 overflow-x-hidden overflow-y-auto">
          <CurrentTool config={config} toolName={toolName} />
        </div>
      </div>
    </>
  );
}

export default Tool;
