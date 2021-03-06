﻿(function () {

    function renderJob(page, job, editOptions) {

        var html = '';

        html += '<p>';
        html += '<label>' + Globalize.translate('LabelName') + '</label>';
        html += '<input id="txtJobName" type="text" required="required" />';
        html += '</p>';

        html += '<p>';
        html += '<label>' + Globalize.translate('LabelSyncTo') + '</label>';
        html += '<input id="txtTargetName" type="text" readonly="readonly" />';
        html += '</p>';

        html += '<p>';
        html += '<label for="selectQuality">' + Globalize.translate('LabelQuality') + '</label>';
        html += '<select id="selectQuality" data-mini="true">';
        html += '<option value="High">' + Globalize.translate('OptionHigh') + '</option>';
        html += '<option value="Medium">' + Globalize.translate('OptionMedium') + '</option>';
        html += '<option value="Low">' + Globalize.translate('OptionLow') + '</option>';
        html += '</select>';
        html += '</p>';

        if (editOptions.Options.indexOf('UnwatchedOnly') != -1) {
            html += '<br/>';
            html += '<div>';
            html += '<label for="chkUnwatchedOnly">' + Globalize.translate('OptionSyncUnwatchedVideosOnly') + '</label>';
            html += '<input type="checkbox" id="chkUnwatchedOnly" data-mini="true" />';
            html += '<div class="fieldDescription">' + Globalize.translate('OptionSyncUnwatchedVideosOnlyHelp') + '</div>';
            html += '</div>';
        }

        if (editOptions.Options.indexOf('SyncNewContent') != -1) {
            html += '<br/>';
            html += '<div>';
            html += '<label for="chkSyncNewContent">' + Globalize.translate('OptionAutomaticallySyncNewContent') + '</label>';
            html += '<input type="checkbox" id="chkSyncNewContent" data-mini="true" />';
            html += '<div class="fieldDescription">' + Globalize.translate('OptionAutomaticallySyncNewContentHelp') + '</div>';
            html += '</div>';
        }

        if (editOptions.Options.indexOf('ItemLimit') != -1) {
            html += '<br/>';
            html += '<div>';
            html += '<label for="txtItemLimit">' + Globalize.translate('LabelItemLimit') + '</label>';
            html += '<input type="number" id="txtItemLimit" step="1" min="1" />';
            html += '<div class="fieldDescription">' + Globalize.translate('LabelItemLimitHelp') + '</div>';
            html += '</div>';
        }

        html += '<br/>';
        html += '<br/>';
        html += '<button type="submit" data-icon="check">' + Globalize.translate('ButtonSave') + '</button>';

        $('.syncJobForm', page).html(html).trigger('create');
        fillJobValues(page, job, editOptions);
    }

    function getJobItemHtml(jobItem, index) {

        var html = '';

        var cssClass = 'ui-li-has-thumb listItem';

        html += '<li class="' + cssClass + '"' + ' data-itemid="' + jobItem.Id + '" data-status="' + jobItem.Status + '">';

        var hasActions = jobItem.Status != 'RemovedFromDevice';
        hasActions = false;

        html += '<a href="#">';

        var imgUrl;

        if (jobItem.PrimaryImageItemId) {

            imgUrl = ApiClient.getImageUrl(jobItem.PrimaryImageItemId, {
                type: "Primary",
                width: 80,
                tag: jobItem.PrimaryImageTag,
                minScale: 1.5
            });
        }

        if (imgUrl) {

            if (index < 10) {
                html += '<div class="listviewImage ui-li-thumb" style="background-image:url(\'' + imgUrl + '\');"></div>';
            } else {
                html += '<div class="listviewImage ui-li-thumb lazy" data-src="' + imgUrl + '"></div>';
            }
        }

        html += '<h3>';
        html += jobItem.ItemName;
        html += '</h3>';

        html += '<p>';
        var stasusLabel = Globalize.translate('SyncJobItemStatus' + jobItem.Status);
        html += stasusLabel;
        html += '</p>';

        html += '</a>';

        if (hasActions) {

            html += '<a href="#" data-icon="ellipsis-v" class="listviewMenuButton btnJobItemMenu">';
        } else {
            html += '<a href="#" data-icon="ellipsis-v" class="listviewMenuButton btnJobItemMenu" style="visibility:hidden;">';
        }
        html += '</a>';

        html += '</li>';
        return html;
    }

    function renderJobItems(page, items) {

        var html = '';

        html += '<ul data-role="listview" class="itemsListview">';

        html += '<li data-role="list-divider">';
        html += Globalize.translate('HeaderItems');
        html += '</li>';

        var index = 0;
        html += items.map(function (i) {

            return getJobItemHtml(i, index++);

        }).join('');

        html += '</ul>';

        var elem = $('.jobItems', page).html(html).trigger('create');

        $('.btnJobItemMenu', elem).on('click', function () {
            showJobItemMenu(this);
        });

    }

    function showJobItemMenu(elem) {

        var page = $(elem).parents('.page');
        var listItem = $(elem).parents('li');
        var id = listItem.attr('data-itemid');
        var status = listItem.attr('data-status');

        $('.jobMenu', page).popup("close").remove();

        var html = '<div data-role="popup" class="jobMenu tapHoldMenu" data-theme="a">';

        html += '<ul data-role="listview" style="min-width: 180px;">';
        html += '<li data-role="list-divider">' + Globalize.translate('HeaderMenu') + '</li>';

        if (status != 'Cancelled' && status != 'RemovedFromDevice' && status != 'Failed') {
            html += '<li data-icon="delete"><a href="#" class="btnCancelJob" data-id="' + id + '">' + Globalize.translate('ButtonCancel') + '</a></li>';
        }

        html += '</ul>';

        html += '</div>';

        page.append(html);

        var flyout = $('.jobMenu', page).popup({ positionTo: elem || "window" }).trigger('create').popup("open").on("popupafterclose", function () {

            $(this).off("popupafterclose").remove();

        });

        $('.btnCancelJob', flyout).on('click', function () {
            //cancelJob(page, this.getAttribute('data-id'));
        });
    }

    function fillJobValues(page, job, editOptions) {

        $('#txtJobName', page).val(job.Name);
        $('#selectQuality', page).val(job.Quality).selectmenu('refresh');
        $('#chkUnwatchedOnly', page).checked(job.UnwatchedOnly).checkboxradio('refresh');
        $('#chkSyncNewContent', page).checked(job.SyncNewContent).checkboxradio('refresh');
        $('#txtItemLimit', page).val(job.ItemLimit);

        var target = editOptions.Targets.filter(function (t) {
            return t.Id == job.TargetId;
        })[0];
        var targetName = target ? target.Name : '';

        $('#txtTargetName', page).val(targetName);
    }

    function loadJob(page) {

        Dashboard.showLoadingMsg();
        var id = getParameterByName('id');

        ApiClient.getJSON(ApiClient.getUrl('Sync/Jobs/' + id)).done(function (job) {

            ApiClient.getJSON(ApiClient.getUrl('Sync/Options', {

                UserId: job.UserId,
                ItemIds: (job.RequestedItemIds && job.RequestedItemIds.length ? job.RequestedItemIds.join('') : null),

                ParentId: job.ParentId,
                Category: job.Category

            })).done(function (options) {

                renderJob(page, job, options);
                Dashboard.hideLoadingMsg();
            });
        });

        ApiClient.getJSON(ApiClient.getUrl('Sync/JobItems', {

            JobId: id,
            AddMetadata: true

        })).done(function (result) {

            renderJobItems(page, result.Items);
            Dashboard.hideLoadingMsg();
        });
    }

    function saveJob(page) {

        Dashboard.showLoadingMsg();
        var id = getParameterByName('id');

        ApiClient.getJSON(ApiClient.getUrl('Sync/Jobs/' + id)).done(function (job) {

            job.Name = $('#txtJobName', page).val();
            job.Quality = $('#selectQuality', page).val();
            job.ItemLimit = $('#txtItemLimit', page).val();
            job.SyncNewContent = $('#chkSyncNewContent', page).checked();
            job.UnwatchedOnly = $('#chkUnwatchedOnly', page).checked();

            ApiClient.ajax({

                url: ApiClient.getUrl('Sync/Jobs/' + id),
                type: 'POST',
                data: JSON.stringify(job),
                contentType: "application/json"

            }).done(function () {

                Dashboard.hideLoadingMsg();
                Dashboard.alert(Globalize.translate('SettingsSaved'));
            });
        });

    }

    $(document).on('pageshow', ".syncJobPage", function () {

        var page = this;
        loadJob(page);

    }).on('pageinit', ".syncJobPage", function () {

        var page = this;


    });

    window.SyncJobPage = {

        onSubmit: function () {

            var form = this;

            var page = $(form).parents('.page');

            saveJob(page);

            return false;
        }
    };

})();