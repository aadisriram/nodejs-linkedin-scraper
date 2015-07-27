function Experience(title, companyName, dates, locality, description) {
    this.title = title;
    this.companyName = companyName;
    this.dates = (function (dates) {
        var dd = (~dates.indexOf('(') ? dates.substring(0, dates.indexOf('(')) : dates).split('–'),
            current = dd[1] && ~dd[1].indexOf('Present') ? true : false;

        return {
            start: dd[0] ? new Date(dd[0]).toJSON() : undefined,
            end: dd[1] && !current ? new Date(dd[1]).toJSON() : undefined,
            current: current
        };
    })(dates);
    //this.dates = dates;
    this.locality = locality;
    this.description = description;
}

module.exports = Experience;
