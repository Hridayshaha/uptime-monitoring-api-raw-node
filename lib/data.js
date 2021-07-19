/*
 *
 * Title: Data Realted Work
 * Description: All of data proecessing work will be done here .
 * Author: Hriday Shaha
 * Date: 5-July-2020
 *
 */
// Dependecies
const path = require('path');
const fs = require('fs');

// Module Scafolding
const lib = {};

// Data proecessing - CRUD Operations
lib.basePath = path.join(`${__dirname}/../.data/`);

// Create Operation
lib.create = (dir, filename, data, callback) => {
    const savedDataPath = path.join(`${lib.basePath}${dir}/${filename}.json`);

    // Open File for writing
    fs.open(savedDataPath, 'wx', (err, fileDescriptor) => {
        if (!err) {
            // Covert data to JSON
            const dataToString = JSON.stringify(data);
            // Write file to crated fileDescriptor
            fs.writeFile(fileDescriptor, dataToString, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('Error to close the file.');
                        }
                    });
                } else {
                    callback('Error To Write the file ');
                }
            });
        } else {
            callback('Cannot Open file for writing');
        }
    });
};

// Read Operation
lib.read = (dir, filename, callback) => {
    const savedDataPath = path.join(`${lib.basePath}${dir}/${filename}.json`);

    fs.readFile(savedDataPath, 'utf8', (err, data) => {
        callback(err, data);
    });
};

// Update Operation
lib.update = (dir, filename, data, callback) => {
    const savedDataPath = path.join(`${lib.basePath}${dir}/${filename}.json`);

    fs.open(savedDataPath, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            // Delete the file
            fs.ftruncate(fileDescriptor, (err1) => {
                if (!err1) {
                    // Whire the file and close it.
                    fs.writeFile(fileDescriptor, stringData, (err2) => {
                        if (!err2) {
                            fs.close(fileDescriptor, (err3) => {
                                if (!err3) {
                                    callback(false);
                                } else {
                                    callback('Error to close the file');
                                }
                            });
                        } else {
                            callback('File Cannot be writeabble. ');
                        }
                    });
                } else {
                    callback('Error to delete the file . ');
                }
            });
        } else {
            callback("Error to open the file. File doesn't exist");
        }
    });
};

// Delete File
lib.delete = (dir, filename, callback) => {
    const savedDataPath = path.join(`${lib.basePath}${dir}/${filename}.json`);

    // Delete file
    fs.unlink(savedDataPath, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error to delete the data ');
        }
    });
};

// List of file
lib.list = (dir, callback) => {
    const savedDataPath = path.join(`${lib.basePath}${dir}`);
    // File List
    fs.readdir(savedDataPath, (err, filenames) => {
        if (!err && filenames && filenames.length > 0) {
            const trimmedPath = [];
            filenames.forEach((filename) => {
                trimmedPath.push(filename.replace('.json', ''));
            });
            callback(false, trimmedPath);
        } else {
            callback('Error to read the directory!');
        }
    });
};

// Module Export
module.exports = lib;
