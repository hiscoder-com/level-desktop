import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import Close from '../public/icons/close.svg';
import Trash from '../public/icons/trash.svg';
import { useGetPersonalNotes } from '../hooks/useGetPersonalNotes';
import Modal from './Modal';

const t = (str) => str;

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
);

export default function PersonalNotes({ config: { id }, toolName }) {
  const [noteId, setNoteId] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [noteToDel, setNoteToDel] = useState(null);
  const { data: notes, mutate } = useGetPersonalNotes(id);

  const saveNote = () => {
    window.electronAPI.updateNote(id, activeNote);
  };

  useEffect(() => {
    if (noteId && notes?.[noteId]) {
      const currentNote = window.electronAPI.getNote(id, noteId);
      setActiveNote(JSON.parse(currentNote));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const addNote = () => {
    const noteId = (
      '000000000' + Math.random().toString(36).substring(2)
    ).slice(-9);
    window.electronAPI.addNote(id, noteId);
    mutate();
  };

  const removeNote = (noteId) => {
    window.electronAPI.removeNote(id, noteId);
    mutate();
  };

  useEffect(() => {
    if (!activeNote) {
      mutate();
      return;
    }
    const timer = setTimeout(() => {
      saveNote();
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote]);

  const removeAllNotes = () => {
    window.electronAPI.removeAllNotes(id);
    mutate();
  };

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          <div className="flex justify-end">
            <button
              className="btn-gray-red mb-4 mr-4"
              onClick={() => setIsOpenModal(true)}
              disabled={!Object.values(notes)?.length}>
              {t('RemoveAll')}
            </button>
            <button
              className="btn-cyan mb-4 text-xl font-bold"
              onClick={addNote}>
              +
            </button>
          </div>
          <div>
            {Object.values(notes).map((el) => (
              <div
                key={el.id}
                className="flex justify-between items-start group my-3 bg-cyan-50 rounded-lg cursor-pointer shadow-md"
                onClick={() => {
                  setNoteId(el.id);
                }}>
                <div className="p-2 mr-4 font-bold">{el.name}</div>
                <button
                  className="p-2 m-1 top-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenModal(true);
                    setNoteToDel(el);
                  }}>
                  <Trash className={'w-4 h-4 text-cyan-800'} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 w-10 pr-3 cursor-pointer"
            onClick={() => {
              saveNote();
              setActiveNote(null);
              setNoteId(null);
            }}>
            <Close />
          </div>
          <Redactor
            classes={{
              title: 'p-2 my-4 mr-12 bg-cyan-50 font-bold rounded-lg shadow-md',
              redactor:
                'pb-20 pt-4 my-4 bg-cyan-50 overflow-hidden break-words rounded-lg shadow-md',
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            placeholder={t('Новая заметка...')}
          />
        </>
      )}
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t('Уверены что хотите удалить ') +
              ' ' +
              t(noteToDel ? noteToDel?.name : t('Все заметки').toLowerCase()) +
              '?'}
          </div>
          <div className="flex gap-7 w-1/2">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false);
                if (noteToDel) {
                  removeNote(noteToDel.id);
                  setNoteToDel(null);
                } else {
                  removeAllNotes();
                }
              }}>
              {t('Да')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false);
                setTimeout(() => {
                  setNoteToDel(null);
                }, 1000);
              }}>
              {t('Нет')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
