import Retelling from './Retelling'
import Bible from './Bible'
import BlindEditor from './BlindEditor'
import Dictionary from './Dictionary'
import Editor from './Editor'
import Info from './Info'
import PersonalNotes from './PersonalNotes'
import TN from './TN'
import TQ from './TQ'
import TWL from './TWL'
import Divider from './Divider'
import TeamNotes from './TeamNotes'
import Merger from './Merger'

function Tool({ config, toolName }) {
  let CurrentTool
  const title = toolName
  switch (toolName) {
    case 'bible':
      CurrentTool = Bible
      break
    case 'divider':
      CurrentTool = Divider
      break
    case 'merger':
      CurrentTool = Merger
      break

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

    case 'twl':
      CurrentTool = TWL
      break

    case 'tn':
      CurrentTool = TN
      break

    case 'tq':
      CurrentTool = TQ
      break

    // case 'Open Bible Stories':
    //   CurrentTool = Bible;

    //   config.resource.bookPath = config.resource.manifest.projects[0]?.path;

    //   url = '/api/git/obs';
    //   break;

    case 'editor':
      CurrentTool = Editor
      break

    case 'blindEditor':
      CurrentTool = BlindEditor
      break

    case 'personalNotes':
      CurrentTool = PersonalNotes
      break

    case 'teamNotes':
      CurrentTool = TeamNotes
      break

    case 'retelling':
      CurrentTool = Retelling
      break

    case 'dictionary':
      CurrentTool = Dictionary
      break

    case 'info':
      CurrentTool = Info
      break

    default:
      return <div>{'WrongResource'}</div>
  }
  return (
    <>
      <div className="pt-2.5 px-4 h-10 font-bold bg-th-primary-200 text-th-text-secondary-100 rounded-t-lg truncate">
        {/* {![
          'translate',
          'commandTranslate',
          'draftTranslate',
          'teamNotes',
          'personalNotes',
          'retelling',
          'dictionary',
        ].includes(toolName) &&
          `${t(`books:${config?.reference?.book}`)} ${
            config?.reference?.chapter
          }, `} */}
        {title}
      </div>
      <div className="adaptive-card border border-b-th-secondary-300 border-l-th-secondary-300 border-r-th-secondary-300 rounded-b-lg box-border">
        <div className="h-full p-4 overflow-x-hidden overflow-y-auto">
          <CurrentTool config={config} toolName={toolName} />
        </div>
      </div>
    </>
  )
}

export default Tool
