(async function () {
    const $btn = $(`.ykb-button`);
    const $list = $(`.list.block .item`)
    const $selectGroups = $(`#groupsSelect`);

    function getRandomInt(min, max) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }

    function updateButtonEvent($btn) {
        $btn.unbind('click');
        $btn.click(() => {
            refreshUserPanel(getRandomUser(group, groupName));
        })
    }

    async function getAllGroups() {
        const response = await (await fetch('assets/peoples.json?rnd=' + (new Date()).getTime())).json()
        return response.groups;
    }

    function getGroup(groups) {
        const urlParams = new URLSearchParams(window.location.search);
        let groupName = urlParams.get('group');
        let group = groups[groupName];
        if (group === undefined) {
            groupName = Object.keys(groups)[0]
            group = groups[groupName];
        }
        return {groupName, group};
    }

    function getRandomUser(group, groupName) {
        const sessionKey = `ofortuna:` + groupName;
        let users = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
        // Отсеиваем из рандома тех, кто был до этого
        let filteredGroup = group.filter(name => users.indexOf(name) === -1);
        // Если все уже были - очищаем список
        if (filteredGroup.length === 0) {
            filteredGroup = group;
            users = [];
        }
        const index = getRandomInt(0, filteredGroup.length - 1);
        const user = filteredGroup[index];
        users.push(user);
        sessionStorage.setItem(sessionKey, JSON.stringify(users));
        return user;
    }

    function refreshUserPanel(user) {
        const $chars = [...user].map((char) => $(`<span class="username-char"/>`).text(char));
        $list.empty();
        $list.append($chars);
    }


    const groups = await getAllGroups();
    let {groupName, group} = getGroup(groups)

    function updateGroupsSelect(groups, $btn, $selectGroups) {
        const $options = Object.keys(groups).map((group) => {
                const $option = $(`<option>`).text(group);
                if (groupName === group) {
                    $option.attr('selected', 'selected');
                }
                return $option;
            }
        );
        $selectGroups.append($options);
        $selectGroups.change(function () {
            const $this = $(this);
            groupName = $this.find('option:selected').text();
            group = groups[groupName];
            if (!group) {
                throw new Error(`Invalid group name ${groupName}`);
            }
            const url = new URL(window.location.href);
            url.searchParams.set('group', groupName);
            window.history.replaceState(null, null, url);
            updateButtonEvent($btn);
        });
    }

    updateGroupsSelect(groups, $btn, $selectGroups);
    updateButtonEvent($btn);
})();