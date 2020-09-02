This Class facilitates lower level operations on the file system, which have been extracted into separate methods for working with SAI's stored data.

# Methods
#### createFolder()
`boolean`
Returns true if the specified folder was created.

#### save()
`Promise<null>`
Returns a promise that resolves null if the save operation was successful. All errors/exceptions are handled by the promise rejection.

#### saveRepository()
`Promise<null>`
Saves data based on the [[Repository Item#Schema|Repository Schema]] and returns a promise that resolves null if the save operation was successful. All errors/exceptions are handled by the promise rejection.

#### saveDictionary()
`Promise<null>`
Returns a promise that resolves null if the save operation was successful. All errors/exceptions are handled by the promise rejection.