import { optionList } from '@/utils/jkOptions'

describe('optionList', () => {
  it('uses the array returned by the request interceptor', () => {
    const options = [{ value: '350203', label: '福建省 / 厦门市 / 思明区' }]

    expect(optionList(options)).toEqual(options)
  })
})
