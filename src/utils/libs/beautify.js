const logger = require('tracer').colorConsole();

/**
 * This func is making the resume details as beautiful json
 * Resume - resume content
 * func - callback
 */

module.exports = {
  beautify
}

function beautify(Resume, func) {
  const experience = Resume.parts.experience
  if (Resume.parts.experience) {
    // console.log('parseExperience(experience)', parseExperience(experience))
    Resume.parts.experience = parseExperience(experience)
  }
  if (Resume.parts.education) {
    // console.log('education', parseEducation(Resume.parts.education))
    Resume.parts.education = parseEducation(Resume.parts.education)
  }
  if (Resume.parts.hobbies) {
    Resume.parts.hobbies = parseHobbies(Resume.parts.hobbies)
  }
  if (Resume.parts.skills) {
    Resume.parts.skills = parseSkills(Resume.parts.skills)
  }
  if (Resume.parts.name) {
    Resume.parts.name = Resume.parts.name.split('\n')[0]
  }
  // logger.trace('length', strList.length)
  // console.log(Resume)
  func(Resume)
}

function checkIfContainYearOnRow(row) {
  let max = 0;
  let current = 0;
  let flag = false;
  for (let i=0; i<row.length; i++) {
    const ch = row[i];
    if(ch >= '0' && ch <= '9') {
      if(!flag) {
        flag = true;
        current = 1
      } else {
        current++;
      }
    } else {
      flag = false
      if(max < current) {
        max = current
      }
      current = 0
    }
  }
  return max
}

removeUnncesessaryRows = (list, removeCount) => {
  const strList = []
  list.map(each => {
    let wcount = 0, ncount = 0
    for (let i=0; i<each.length; i++) {
      if((each[i] >= 'a' && each[i] <= 'z') || (each[i] >= 'A' && each[i] <= 'Z')) {
        wcount++;
      }
      if((each[i] >= '0' && each[i] <= '9')) {
        ncount++;
      }
    }
    if(removeCount) {
      if(wcount !== 0) {
        strList.push(each)
      }
    } else {
      if(wcount !== 0 || ncount !== 0) {
        strList.push(each)
      }
    }
  })
  return strList
}


function getYearOfTheRow(row) {
  let current = 0;
  let flag = false;
  let year = ''
  for (let i=0; i<row.length; i++) {
    const ch = row[i];
    if(ch >= '0' && ch <= '9') {
      if(!flag) {
        flag = true;
        current = 1
        year = ch
      } else {
        current++;
        year += ch
      }
    } else {
      flag = false
      if(current === 4) {
        return year
      }
      current = 0
      year = ''
    }
  }
  return year
}

function getNumberOfTheRow(row) {
  let number = ''
  for (let i=0; i<row.length; i++) {
    const ch = row[i];
    if(ch >= '0' && ch <= '9') {
      number += ch
    }
  }
  return number
}

function getMonthFromStr(str) {
  const keywords = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ]
  let month = null
  keywords.map((keyword, index) => {
    if(str.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
      month = {
        index: (index % 12) + 1,
        name: keyword
      }
    } 
  })

  if (!month) {
    if(checkIfContainYearOnRow(str) === 2 || checkIfContainYearOnRow(str) === 1) {
      month = {
        index: parseInt(getNumberOfTheRow(str), 10),
        name: getNumberOfTheRow(str),
      }
    }
  }

  return month
}

function checkIfOngoing(str) {
  const keywords = ['Ongoing', 'Present', 'Current']
  let flag = false
  keywords.map(keyword => {
    if(str.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
      flag = true
    } 
  })
  return flag
}

function parseDate(str) {
  if(!str) {
    return {
      string: '',
    }
  }
  let temp = str.trim()
  const year = getYearOfTheRow(temp)
  temp = temp.replace(year, '')
  const month = getMonthFromStr(temp)
  if(month) {
    temp = temp.replace(month.name, '')
    temp = temp.replace(month.name.toLowerCase(), '')
  }
  temp = temp.trim()
  const day = ((temp.length === 1 && checkIfContainYearOnRow(temp) === 1) || (temp.length === 2 && checkIfContainYearOnRow(temp) === 2)) ? temp : 1
  return {
    string: str,
    year,
    month: month ? month.index : 1,
    day,
    current: checkIfOngoing(str)
  }
}

function parseUniversity(str) {
  if(!str) {
    return ''
  }
  let temp = str.trim()
  const year = getYearOfTheRow(temp)
  temp = temp.replace(year, '')
  const month = getMonthFromStr(temp)
  if(month) {
    temp = temp.replace(month.name, '')
    temp = temp.replace(month.name.toLowerCase(), '')
  }
  temp = temp.trim()
  return temp;
}

function parseExperience(experience) {
  const list = []
  const strList = removeUnncesessaryRows(experience.split('\n'))
  
  let yearIndex = -1, yearList = []
  for (let i=0; i < strList.length; i++) {
    const str = strList[i]
    if(checkIfContainYearOnRow(str) >= 4) {
      if(yearIndex === -1) {
        yearIndex = i
      }
      yearList.push(i)
    }
  }
  for (let i=0; i < yearList.length; i++) {
    const yIndex = yearList[i]
    let yearStr = '', titleStr, descriptionStr = '', startIndex = 0, endIndex = 0
    if (yearIndex === 0) {
      yearStr = strList[yIndex]
      titleStr = strList[yIndex + 1]
      startIndex = yIndex + 2
      endIndex = ((i === yearList.length - 1) ? strList.length - 1 : yearList[i + 1] - 1)
    } else if(yearIndex === 1) {
      yearStr = strList[yIndex]
      titleStr = strList[yIndex - 1]
      startIndex = yIndex + 1
      endIndex = ((i === yearList.length - 1) ? strList.length - 1 : yearList[i + 1] - 2)
    } else if (yearIndex === 2) {
      yearStr = strList[yIndex]
      titleStr = strList[yIndex - 2] + ' ' + strList[yIndex - 1] 
      startIndex = yIndex + 1
      endIndex = ((i === yearList.length - 1) ? strList.length - 1 : yearList[i + 1] - 3)
    }
    for(let j=startIndex; j<=endIndex; j++) {
      descriptionStr += strList[j] + '\n'
    }

    let yearStrs = []
    if (yearStr.split('to').length === 2) yearStrs = yearStr.split('to')
    else if (yearStr.split('-').length === 2) yearStrs = yearStr.split('-')
    else if (yearStr.split('/').length === 2) yearStrs = yearStr.split('-')
    const startDate = parseDate(yearStrs[0])
    const endDate = parseDate(yearStrs[1])
    list.push({
      year: yearStr,
      startDate,
      endDate,
      title: titleStr,
      description: descriptionStr
    })
  }

  return list
}

function parseEducation(experience) {
  const list = []
  const strList = removeUnncesessaryRows(experience.split('\n'))

  let yearIndex = -1, yearList = []
  for (let i=0; i < strList.length; i++) {
    const str = strList[i]
    if(checkIfContainYearOnRow(str) >= 4) {
      if(yearIndex === -1) {
        yearIndex = i
      }
      yearList.push(i)
    }
  }
  for (let i=0; i < yearList.length; i++) {
    const yIndex = yearList[i]
    let yearStr = '', titleStr, descriptionStr = '', startIndex = 0, endIndex = 0
    if (yearIndex === 0) {
      yearStr = strList[yIndex]
      titleStr = strList[yIndex + 1]
      startIndex = yIndex + 2
      endIndex = ((i === yearList.length - 1) ? strList.length - 1 : yearList[i + 1] - 1)
    } else if(yearIndex === 1) {
      yearStr = strList[yIndex]
      titleStr = strList[yIndex - 1]
      startIndex = yIndex + 1
      endIndex = ((i === yearList.length - 1) ? strList.length - 1 : yearList[i + 1] - 2)
    } else if (yearIndex === 2) {
      yearStr = strList[yIndex]
      titleStr = strList[yIndex - 2] + ' ' + strList[yIndex - 1] 
      startIndex = yIndex + 1
      endIndex = ((i === yearList.length - 1) ? strList.length - 1 : yearList[i + 1] - 3)
    }
    for(let j=startIndex; j<=endIndex; j++) {
      descriptionStr += strList[j] + '\n'
    }
    if(titleStr && (titleStr.includes('Bachelor') || titleStr.includes('Master'))) {
      descriptionStr = titleStr
      titleStr = ''
    }
    let yearStrs = []
    if (yearStr.split('to').length === 2) yearStrs = yearStr.split('to')
    else if (yearStr.split('-').length === 2) yearStrs = yearStr.split('-')
    else if (yearStr.split('/').length === 2) yearStrs = yearStr.split('-')
    
    if(!titleStr) {
      titleStr = parseUniversity(yearStrs[0])
    }

    const startDate = parseDate(yearStrs[0])
    const endDate = parseDate(yearStrs[1])
    list.push({
      year: yearStr,
      startDate,
      endDate,
      title: titleStr,
      description: descriptionStr
    })
  }

  return list
}


function parseHobbies(hobbies) {
  const strList = removeUnncesessaryRows(hobbies.split('\n'), true)
  const longStr = strList.join(' ')
  const commaList = longStr.split(',')
  const hobbyList = []
  commaList.map(commaStr => {
    const regex = /[A-Z][a-z]*(\s?[a-z]*)+/
    while(commaStr) {
      const wordsList = regex.exec(commaStr)
      if(wordsList) {
        hobbyList.push(wordsList[0].trim())
        commaStr = commaStr.replace(wordsList[0], '')
      } else {
        break
      }
    }
  })
  return hobbyList
}

function parseSkills(skills) {
  const skillsList = removeUnncesessaryRows(skills.split('\n'), true)
  return skillsList
}