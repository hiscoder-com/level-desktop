import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import Down from 'public/icons/arrow-down.svg'

function ListBox({ options, selectedOption, setSelectedOption }) {
  return (
    <Listbox value={selectedOption} onChange={(e) => setSelectedOption(e)}>
      {({ open }) => (
        <>
          <div className="relative text-th-text-primary">
            <ListboxButton className="relative flex w-full justify-between rounded-lg bg-th-secondary-10 px-5 py-3">
              <span>
                {options?.find((option) => option.value === selectedOption)?.label}
              </span>
              <Down className="h-6 w-6 min-w-[1.5rem] stroke-th-text-primary" />
            </ListboxButton>
            <div className={`-mt-2 pt-5 ${open ? 'bg-th-secondary-10' : ''}`}>
              <ListboxOptions className="absolute z-10 max-h-[40vh] w-full overflow-y-auto rounded-b-lg bg-th-secondary-10">
                {options.map((el) => (
                  <ListboxOption
                    className="relative cursor-pointer bg-th-secondary-10 px-5 py-1 last:pb-3 hover:bg-th-secondary-100"
                    key={el.value}
                    value={el.value}
                  >
                    {el.label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </div>
        </>
      )}
    </Listbox>
  )
}

export default ListBox
